import { ApiPromise } from '@polkadot/api';
import { Asset, PerPallet, } from '../types';
import { CurrencyId, PoolId, DexShare } from "@acala-network/types/interfaces/"
import {  } from "@open-web3/orml-types/interfaces"
import { types } from "@acala-network/types"
import BN from 'bn.js';

function currencyIdToTokenName(currencyId: CurrencyId): string {
	if (currencyId.isDexShare) {
		return `LP ${currencyId.asDexShare.map((t) => t.isToken? t.asToken.toString() : "UNKNOWN_CURRENCY").join('-')}`;
	} else if (currencyId.isForeignAsset) {
		return `foreign_asset_${currencyId.asForeignAsset}`
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

export async function fetch_tokens(api: ApiPromise, account: string): Promise<PerPallet> {
	api.registerTypes(types)
	const assets: Asset[] = [];

	const entries = await api.query.tokens.accounts.entries(account);
	for (const [key, token_data_raw] of entries) {
		const token_type: CurrencyId = api.createType('CurrencyId', key.args[1].toU8a());
		const token_data = api.createType('OrmlAccountData', token_data_raw)
		if (token_type.isToken) {
			const token_name = token_type.asToken.toString();
		} else if (token_type.isForeignAsset) {
			const foreign_asset_id = token_type.asForeignAsset.toNumber();
			console.log(foreign_asset_id, token_data.toHuman());
			assets.push(new Asset({
				amount: token_data.free,
				decimals: new BN(1),
				is_native: false,
				name: currencyIdToTokenName(token_type),
				price: 0,
				token_name: currencyIdToTokenName(token_type),
				transferrable: true
			}))
		}
	}

	const allPoolIds: PoolId[] = (await api.query.rewards.poolInfos.entries()).map(([key, value]) => key.args[0]);
	for (const poolId of allPoolIds) {
		const sharesAndRewards = await api.query.rewards.sharesAndWithdrawnRewards(poolId, account);
		const [amount, rewardsMap] = sharesAndRewards;
		if (!amount.isZero()) {
			assets.push(new Asset({
				amount,
				decimals: new BN(1),
				is_native: false,
				name: poolToTokenName(poolId),
				token_name: poolToTokenName(poolId),
				price: 0,
				transferrable: true
			}))
		}
	}


	return new PerPallet({ assets, name: "tokens" })
}
