import { ApiPromise } from "@polkadot/api";
import BN from "bn.js";
import { Asset, PerPallet } from "../types";


export async function fetch_crowdloan_rewards(api: ApiPromise, account: string, token_name: string, price: number): Promise<PerPallet> {
	// really wacky way of decoding shit...
	// @ts-ignore
	const [_, total, claimed, _dont_care] = api.createType(
		'(U8, Balance, Balance, Vec<AccountId32>)',
		(await api.query.crowdloanRewards.accountsPayable(account)).toU8a(),
	);
	const locked = total.sub(claimed);

	const decimals = new BN(api.registry.chainDecimals[0]);
	return new PerPallet({ assets: [new Asset({ name: "crowdloan rewards", token_name, price, transferrable: false, amount: locked, decimals, is_native: true })], name: "crowdloanRewards" })
}
