import { ApiPromise } from '@polkadot/api';
import { Asset, PerPallet, } from '../types';
import { CurrencyId} from "@acala-network/types/interfaces/"
import { OrmlAccountData } from "@open-web3/orml-types/interfaces"
import { types } from "@acala-network/types"


export async function fetch_tokens(api: ApiPromise, account: string): Promise<PerPallet> {
	api.registerTypes(types)
	const assets: Asset[] = [];
	const entries = await api.query.tokens.accounts.entries(account);
	for (const [key, token_data_raw] of entries) {
		// const token_type: CurrencyId = api.createType('CurrencyId', key.args[1].toU8a());
		// const token_data = api.createType('OrmlAccountData', token_data_raw)
		// if (token_type.isToken) {
		// 	const token_name = token_type.asToken.toString();
		// 	console.log(token_name, token_data.toHuman())
		// } else if (token_type.isForeignAsset) {
		// 	const foreign_asset_id = token_type.asForeignAsset.toNumber();
		// 	console.log(foreign_asset_id);
		// }
	}

	// const api = await ApiPromise.create(options({ provider }));
	// const liquidity = await api.query.dex.liquidityPool(
	// 	[
	// 		{ TOKEN: "KAR" },
	// 		{ TOKEN: "KSM" },
	// 	],
	// 	account
	//   );
	//   // @ts-ignore
	//   console.log((liquidity as any).map((t) => t.toHuman()));

	return new PerPallet({ assets, name: "tokens" })
}
