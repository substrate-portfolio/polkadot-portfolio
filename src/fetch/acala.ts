import { ApiPromise } from '@polkadot/api';
import { u128 } from '@polkadot/types';
import { Asset, PerPallet, } from '../types';
import { CurrencyId, PoolId, TradingPair } from "@acala-network/types/interfaces/"
import { OrmlAccountData } from "@open-web3/orml-types/interfaces/"
import { types } from "@acala-network/types"
import BN from 'bn.js';
import { findDecimals, priceOf } from '../utils';
import { apiRegistry } from '..';

// find the price of an asset by looking into its dex value, when converted into another one. This
// is useful to fund the price of something like LKSM, LC-DOT or LDOT. It takes `amount` of
// `unknonw` and returns
async function findPriceViaDex(api: ApiPromise, unknown: CurrencyId, unknownAmount: BN, known: CurrencyId): Promise<number> {
	const [knownTotal, unknownTotal] = await api.query.dex.liquidityPool([known, unknown]);
	if (unknownTotal.isZero()) {
		return 0
	}
	const knownAmount = unknownAmount.mul(knownTotal).div(unknownTotal);
	const knownPrice = new BN(await priceOf(formatCurrencyId(known)));
	return knownAmount.mul(knownPrice).div(unknownAmount).toNumber()
}

function formatCurrencyId(currencyId: CurrencyId): string {
	if (currencyId.isDexShare) {
		// TODO: this seems like mistake in acala types?
		const p0 = currencyId.asDexShare[0] as CurrencyId;
		const p1 = currencyId.asDexShare[1] as CurrencyId;
		return `LP ${formatCurrencyId(p0)}-${formatCurrencyId(p1)}`;
	} else if (currencyId.isForeignAsset) {
		return `foreignAsset${currencyId.asForeignAsset}`
	} else if (currencyId.isLiquidCroadloan) {
		return `LC-${currencyId.asLiquidCroadloan}`
	} else if (currencyId.isToken) {
		return `${currencyId.asToken.toString()}`
	} else {
		return "UNKNOWN_CURRENCY"
	}
}

function poolToTokenName(pool: PoolId): string {
	if (pool.isDex) {
		return formatCurrencyId(pool.asDex);
	} else if (pool.isLoans) {
		return `${formatCurrencyId(pool.asLoans)}`;
	} else {
		return "UNKNOWN_POOL"
	}
}

function poolToName(pool: PoolId): string {
	if (pool.isDex) {
		return formatCurrencyId(pool.asDex);
	} else if (pool.isLoans) {
		return `Loaned-${formatCurrencyId(pool.asLoans)}`;
	} else {
		return "UNKNOWN_POOL"
	}
}

async function processToken(api: ApiPromise, token: CurrencyId, accountData: OrmlAccountData): Promise<Asset | undefined> {
	if (token.isToken) {
		const tokenName = token.asToken.toString();
		const KnownToken = api.createType('CurrencyId', { 'Token': 'KSM' });
		const price = Math.max(await priceOf(tokenName), await findPriceViaDex(api, token, accountData.free, KnownToken));
		const decimals = findDecimals(api, tokenName);
		return new Asset({
			amount: accountData.free,
			decimals,
			name: formatCurrencyId(token),
			price,
			token_name: tokenName,
			transferrable: true
		})
	} else if (token.isForeignAsset) {
		const assetMetadata = (await api.query.assetRegistry.assetMetadatas({ 'ForeignAssetId': token.asForeignAsset })).unwrap();
		const price = await priceOf(assetMetadata.toHuman().name.toLowerCase());
		return new Asset({
			amount: accountData.free,
			decimals: new BN(assetMetadata.decimals),
			name: formatCurrencyId(token),
			price,
			token_name: assetMetadata.toHuman().name,
			transferrable: true
		})
	} else {
		undefined
	}
}

export async function fetch_reward_pools(api: ApiPromise, account: string): Promise<PerPallet> {
	api.registerTypes(types);
	const assets: Asset[] = [];

	const allPoolIds: PoolId[] = (await api.query.rewards.poolInfos.entries()).map(([key, value]) => key.args[0]);
	for (const poolId of allPoolIds) {
		const [amount, rewardsMap] = await api.query.rewards.sharesAndWithdrawnRewards(poolId, account);
		if (!amount.isZero()) {
			const poolName = poolToName(poolId);
			const poolTokenName = poolToTokenName(poolId);

			// if this is an LP pool, we register each individual asset independently as well. note
			// that we also register the LP token, which will always have a value of zero.
			if (poolId.isDex && poolId.asDex.isDexShare) {
				const p0 = poolId.asDex.asDexShare[0] as CurrencyId;
				const p1 = poolId.asDex.asDexShare[1] as CurrencyId;
				const poolTotalShares = (await api.query.rewards.poolInfos(poolId)).totalShares;
				const poolCurrentShares = await api.query.dex.liquidityPool([p0, p1]);
				const p0Amount = poolCurrentShares[0].mul(amount).div(poolTotalShares);
				const p1Amount = poolCurrentShares[1].mul(amount).div(poolTotalShares);

				const KnownToken = api.createType('CurrencyId', { 'Token': 'KSM' });
				const p0Name = formatCurrencyId(p0);
				const p1Name = formatCurrencyId(p1);
				assets.push(new Asset({
					amount: p0Amount,
					decimals: findDecimals(api, p0Name),
					name: `[LP-derived] ${p0Name}`,
					token_name: p0Name,
					price: Math.max(await findPriceViaDex(api, p0, p0Amount, KnownToken), await priceOf(p0Name)),
					transferrable: false
				}))
				assets.push(new Asset({
					amount: p1Amount,
					decimals: findDecimals(api, p1Name),
					name: `[LP-derived] ${p1Name}`,
					token_name: p1Name,
					price: Math.max(await findPriceViaDex(api, p1, p1Amount, KnownToken), await priceOf(p1Name)),
					transferrable: false
				}))
			}

			assets.push(new Asset({
				amount,
				decimals: findDecimals(api, poolTokenName),
				name: poolName,
				token_name: poolTokenName,
				price: await priceOf(poolTokenName),
				transferrable: false
			}))
		}
	}

	return new PerPallet({ assets, name: "rewardPools" })
}

export async function fetch_tokens(api: ApiPromise, account: string): Promise<PerPallet> {
	api.registerTypes(types)
	const assets: Asset[] = [];

	const entries = await api.query.tokens.accounts.entries(account);

	for (const [key, token_data_raw] of entries) {
		const token: CurrencyId = api.createType('CurrencyId', key.args[1].toU8a());
		const tokenData = api.createType('OrmlAccountData', token_data_raw);
		const maybeAsset = await processToken(api, token, tokenData);
		if (maybeAsset) {
			assets.push(maybeAsset);
		}
	}

	return new PerPallet({ assets, name: "tokens" })
}
