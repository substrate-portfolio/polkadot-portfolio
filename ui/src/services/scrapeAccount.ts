import { ApiPromise } from "@polkadot/api";
import { Asset } from "../store/types/Asset";
import { fetch_assets, fetch_crowdloan, fetch_reward_pools, fetch_system, fetch_tokens } from "./fetch";
import { fetch_crowdloan_rewards } from "./fetch/moonbeam";

export async function scrapeAccountFunds(account: string, network: string, api: ApiPromise): Promise<Asset[]> {
	let assets: Asset[] = [];
	const chain = (await api.rpc.system.chain()).toString();

	try {
		if (api.query.system) {
			const system = await fetch_system(api, network, account, chain);
			assets = assets.concat(system)
		}

		if (api.query.crowdloanRewards) {
			const cRewards = await fetch_crowdloan_rewards(api, network, account, chain);
			assets = assets.concat(cRewards)
		}

		if (api.query.crowdloan) {
			const crowdloan = await fetch_crowdloan(api, network, account, chain);
			assets = assets.concat(crowdloan)
		}

		if (api.query.assets) {
			const _assets = await fetch_assets(api, network, account, chain);
			assets = assets.concat(_assets)
		}

		if (api.query.tokens) {
			const tokens = await fetch_tokens(api, network, account, chain);
			assets = assets.concat(tokens)
		}

		if (api.query.rewards) {
			const rewardPools = await fetch_reward_pools(api, network, account, chain);
			assets = assets.concat(rewardPools)
		}
	} catch(e) {
		console.error(`error while fetching ${account}`);
		// throw(e)
	}

	return assets
}