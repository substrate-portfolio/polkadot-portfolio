import { ApiPromise } from '@polkadot/api';
import { Asset, PerPallet, } from '../types';
import { CurrencyId, PoolId,  } from "@acala-network/types/interfaces/"
import { OrmlAccountData } from "@open-web3/orml-types/interfaces/"
import { types } from "@acala-network/types"
import BN from 'bn.js';
import { findDecimals, priceOf } from '../utils';

function currencyIdToTokenName(currencyId: CurrencyId): string {
	if (currencyId.isDexShare) {
		return `LP ${currencyId.asDexShare.map((t) => t.isToken? t.asToken.toString() : "UNKNOWN_CURRENCY").join('-')}`;
	} else if (currencyId.isForeignAsset) {
		return `foreignAsset${currencyId.asForeignAsset}`
	} else if (currencyId.isToken) {
		return currencyId.asToken.toString()
	} else {
		return "UNKNOWN_CURRENCY"
	}
}

function poolToTokenName(pool: PoolId): string {
	if (pool.isDex) {
		return currencyIdToTokenName(pool.asDex);
	} else if (pool.isLoans) {
		return currencyIdToTokenName(pool.asLoans);
	} else {
		return "UNKNOWN_POOL"
	}
}

async function processToken(api: ApiPromise, token: CurrencyId, accountData: OrmlAccountData): Promise<Asset | undefined> {
	if (token.isToken) {
		const tokenName = token.asToken.toString();
		const price = await priceOf(tokenName);
		const decimals = findDecimals(api, tokenName);
		return new Asset({
			amount: accountData.free,
			decimals,
			name: currencyIdToTokenName(token),
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
			name: currencyIdToTokenName(token),
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
	const assets = [];

	const allPoolIds: PoolId[] = (await api.query.rewards.poolInfos.entries()).map(([key, value]) => key.args[0]);
	for (const poolId of allPoolIds) {
		const [amount, rewardsMap] = await api.query.rewards.sharesAndWithdrawnRewards(poolId, account);
		if (!amount.isZero()) {
			assets.push(new Asset({
				amount,
				decimals: findDecimals(api, poolToTokenName(poolId)),
				name: poolToTokenName(poolId),
				token_name: poolToTokenName(poolId),
				price: await priceOf(poolToTokenName(poolId)),
				transferrable: true
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
