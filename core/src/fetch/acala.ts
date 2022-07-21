// @ts-nocheck
import { ApiPromise } from '@polkadot/api';
import { Asset, AssetOrigin } from '../types';
import { CurrencyId, PoolId, DexShare } from '@acala-network/types/interfaces/';
import { OrmlAccountData } from '@open-web3/orml-types/interfaces/';
import { types } from '@acala-network/types';
import BN from 'bn.js';
import { findDecimals, priceOf } from '../utils';
import { IValueBearing } from '.';

async function findPriceOrCheckDex(api: ApiPromise, x: CurrencyId, y: CurrencyId): Promise<number> {
	const normal = await priceOf(formatCurrencyId(x));
	if (normal > 0) {
		return normal;
	} else {
		return await findPriceViaDex(api, x, y);
	}
}

const PRICE_CACHE: Map<string, number> = new Map();

// find the price of an asset by looking into its dex value, when converted into another one. This
// is useful to fund the price of something like LKSM, LC-DOT or LDOT. It takes `amount` of
// `unknown` and returns
async function findPriceViaDex(api: ApiPromise, x: CurrencyId, y: CurrencyId): Promise<number> {
	if (PRICE_CACHE.has(formatCurrencyId(x))) {
		return PRICE_CACHE.get(formatCurrencyId(x))!;
	}

	const [xTotal, yTotal] = await dexLiquidityOf(api, x, y);
	if (xTotal.isZero() || yTotal.isZero()) {
		console.log(
			`⛔️ failed to get price of ${x.toString()} via ${y.toString()}. Does a pool for them exist?`
		);
		return 0;
	}

	// now get the price of `y`, then known token..
	const MUL = 10000;
	const yPrice = new BN((await priceOf(formatCurrencyId(y))) * MUL);
	console.log(
		`🎩 price of ${x.toString()} via ${y.toString()} is ${yTotal.mul(yPrice).div(xTotal).toNumber() / MUL
		}`
	);
	const price = yTotal.mul(yPrice).div(xTotal).toNumber() / MUL;
	PRICE_CACHE.set(formatCurrencyId(x), price);
	return price;
}

async function dexLiquidityOf(api: ApiPromise, x: CurrencyId, y: CurrencyId): Promise<[BN, BN]> {
	let [yTotal, xTotal]: [BN, BN] = [new BN(0), new BN(0)];
	try {
		[yTotal, xTotal] = await api.query.dex.liquidityPool([y.toHuman(), x.toHuman()]);
	} catch {
		[xTotal, yTotal] = await api.query.dex.liquidityPool([x.toHuman(), y.toHuman()]);
	}
	return [xTotal, yTotal];
}

function formatCurrencyId(currencyId: CurrencyId): string {
	if (currencyId.isDexShare) {
		const p0 = currencyId.asDexShare[0] as CurrencyId;
		const p1 = currencyId.asDexShare[1] as CurrencyId;
		return `LP ${formatCurrencyId(p0)}-${formatCurrencyId(p1)}`;
	} else if (currencyId.isForeignAsset) {
		return `foreignAsset${currencyId.asForeignAsset}`;
	} else if (currencyId.isLiquidCroadloan) {
		return `LC-${currencyId.asLiquidCroadloan}`;
		//@ts-ignore
	} else if (currencyId.isLiquidCrowdloan) {
		//@ts-ignore
		return `LC-${currencyId.asLiquidCrowdloan}`;
	} else if (currencyId.isToken) {
		return `${currencyId.asToken.toString()}`;
	} else {
		return 'UNKNOWN_CURRENCY';
	}
}

function formatDexShare(share: DexShare): string {
	if (share.isToken) {
		return share.asToken.toString();
	} else if (share.isErc20) {
		return `ERC20-${share.asErc20}`;
	} else {
		return `UNKNOWN_DEX_SHARE`;
	}
}

function poolToTokenName(pool: PoolId): string {
	if (pool.isDex) {
		return formatCurrencyId(pool.asDex);
	} else if (pool.isLoans) {
		return `${formatCurrencyId(pool.asLoans)}`;
	} else {
		return 'UNKNOWN_POOL';
	}
}

function poolToName(pool: PoolId): string {
	if (pool.isDex) {
		return formatCurrencyId(pool.asDex);
	} else if (pool.isLoans) {
		return `Loaned-${formatCurrencyId(pool.asLoans)}`;
	} else {
		return 'UNKNOWN_POOL';
	}
}

async function processToken(
	api: ApiPromise,
	token: CurrencyId,
	accountData: OrmlAccountData,
	origin: AssetOrigin
): Promise<Asset | undefined> {
	if (token.isToken) {
		const tokenName = token.asToken.toString();
		const knownToken = api.createType('CurrencyId', { Token: api.registry.chainTokens[0] });
		const price = await findPriceOrCheckDex(api, token, knownToken);
		const decimals = findDecimals(api, tokenName);
		return new Asset({
			amount: accountData.free,
			decimals,
			name: formatCurrencyId(token),
			price,
			token_name: tokenName,
			transferrable: true,
			origin
		});
	} else if (token.isForeignAsset) {
		const assetMetadata = (
			await api.query.assetRegistry.assetMetadatas({ ForeignAssetId: token.asForeignAsset })
		).unwrap();
		const price = await priceOf(assetMetadata.toHuman().name.toLowerCase());
		return new Asset({
			amount: accountData.free,
			decimals: new BN(assetMetadata.decimals),
			name: formatCurrencyId(token),
			price,
			token_name: assetMetadata.toHuman().name,
			transferrable: true,
			origin
		});
	} else {
		undefined;
	}
}

export async function fetch_reward_pools(
	api: ApiPromise,
	account: string,
	chain: string
): Promise<Asset[]> {
	api.registerTypes(types);
	const assets: Asset[] = [];

	const allPoolIds: PoolId[] = (await api.query.rewards.poolInfos.entries()).map(
		([key, value]) => key.args[0]
	);
	for (const poolId of allPoolIds) {
		const [amount, rewardsMap] = await api.query.rewards.sharesAndWithdrawnRewards(poolId, account);
		if (!amount.isZero()) {
			const poolName = poolToName(poolId);
			const poolTokenName = poolToTokenName(poolId);

			// if this is an LP pool, we register each individual asset independently as well. note
			// that we also register the LP token, which will always have a value of zero.
			if (poolId.isDex && poolId.asDex.isDexShare) {
				const p0: CurrencyId = poolId.asDex.asDexShare[0] as CurrencyId;
				const p1: CurrencyId = poolId.asDex.asDexShare[1] as CurrencyId;

				const poolTotalShares = (await api.query.rewards.poolInfos(poolId)).totalShares;

				let poolCurrentShares;
				try {
					poolCurrentShares = await api.query.dex.liquidityPool([p0.toHuman(), p1.toHuman()]);
				} catch {
					poolCurrentShares = await api.query.dex.liquidityPool([p1.toHuman(), p0.toHuman()]);
				}
				const p0Amount = poolCurrentShares[0].mul(amount).div(poolTotalShares);
				const p1Amount = poolCurrentShares[1].mul(amount).div(poolTotalShares);

				// wacky, but works: we use the chain's main token as a swappable token in the dex.
				const knownToken = api.createType('CurrencyId', { Token: api.registry.chainTokens[0] });
				const p0Name = formatCurrencyId(p0);
				const p1Name = formatCurrencyId(p1);

				assets.push(
					new Asset({
						amount: p0Amount,
						decimals: findDecimals(api, p0Name),
						name: `[LP-derived] ${p0Name}`,
						token_name: p0Name,
						price: await findPriceOrCheckDex(api, p0, knownToken),
						transferrable: false,
						origin: { account, chain, source: 'reward pools pallet' }
					})
				);

				assets.push(
					new Asset({
						amount: p1Amount,
						decimals: findDecimals(api, p1Name),
						name: `[LP-derived] ${p1Name}`,
						token_name: p1Name,
						price: await findPriceOrCheckDex(api, p1, knownToken),
						transferrable: false,
						origin: { account, chain, source: 'reward pools pallet' }
					})
				);
			}

			assets.push(
				new Asset({
					amount,
					decimals: findDecimals(api, poolTokenName),
					name: poolName,
					token_name: poolTokenName,
					price: await priceOf(poolTokenName),
					transferrable: false,
					origin: { account, chain, source: 'reward pools pallet' }
				})
			);
		}
	}

	return assets;
}

export async function fetch_tokens(
	api: ApiPromise,
	account: string,
	chain: string
): Promise<Asset[]> {
	api.registerTypes(types);
	const assets: Asset[] = [];
	const origin: AssetOrigin = { account, chain, source: 'tokens pallet' };
	const entries = await api.query.tokens.accounts.entries(account);

	for (const [key, token_data_raw] of entries) {
		const token = key.args[1];
		const tokenData = api.createType('OrmlAccountData', token_data_raw);
		const maybeAsset = await processToken(api, token, tokenData, origin);
		if (maybeAsset) {
			assets.push(maybeAsset);
		}
	}

	return assets;
}
