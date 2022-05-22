import { ApiPromise } from "@polkadot/api";
import BN from "bn.js";
import { Asset } from "../../store/types/Asset";
import { priceOf } from "../../utils";


export async function fetch_crowdloan_rewards(api: ApiPromise, account: string, chain: string): Promise<Asset[]> {
	const token_name = api.registry.chainTokens[0];
	const price = await priceOf(chain);
	// really wacky way of decoding shit...
	const [_, total, claimed, _dont_care] = api.createType(
		'(U8, Balance, Balance, Vec<AccountId32>)',
		(await api.query.crowdloanRewards.accountsPayable(account)).toU8a(),
	);
	const locked = total.sub(claimed);

	const decimals = new BN(api.registry.chainDecimals[0]);
	return [
		new Asset({
			name: `crowdloan ${token_name}`,
			token_name,
			price,
			transferrable: false,
			amount: locked,
			decimals,
			origin: { account, chain, source: "crowdloan rewards pallet" }
		})
	]
}
