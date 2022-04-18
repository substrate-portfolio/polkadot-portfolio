import { ApiPromise } from "@polkadot/api";
import { PerAccount } from "../store/types";
import { fetch_assets, fetch_crowdloan, fetch_reward_pools, fetch_system, fetch_tokens } from "./fetch";
import { fetch_crowdloan_rewards } from "./fetch/moonbeam";

export async function scrapeAccountFunds(account: string, name: string, nativeToken: string, price: number, api: ApiPromise): Promise<PerAccount> {
	const perAccount = new PerAccount({ pallets: [], id: account, name });
	try {
		if (api.query.system) {
			const system = await fetch_system(api, account, nativeToken, price);
			perAccount.pallets.push(system)
		}

		if (api.query.crowdloanRewards) {
			const system = await fetch_crowdloan_rewards(api, account, nativeToken, price);
			perAccount.pallets.push(system)
		}

		if (api.query.vesting) {
			// const vesting = await fetch_vesting(api, account, block_number);
		}

		if (api.query.crowdloan) {
			const crowdloan = await fetch_crowdloan(api, account, nativeToken, price);
			perAccount.pallets.push(crowdloan)
		}

		if (api.query.assets) {
			const assets = await fetch_assets(api, account);
			perAccount.pallets.push(assets);
		}

		if (api.query.tokens) {
			const assets = await fetch_tokens(api, account);
			perAccount.pallets.push(assets);
		}

		if (api.query.rewards) {
			const assets = await fetch_reward_pools(api, account);
			perAccount.pallets.push(assets);
		}
	} catch(e) {
		console.error(`error while fetching ${account}/${name} on ${nativeToken}: ${e}`);
	}

	return perAccount
}