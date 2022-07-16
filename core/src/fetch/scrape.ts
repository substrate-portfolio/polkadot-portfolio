import { ApiPromise, WsProvider } from "@polkadot/api";
import { Asset } from "../types";
import { fetch_tokens, fetch_crowdloan_rewards, fetch_system, fetch_crowdloan, fetch_assets, fetch_reward_pools, } from "./"

export async function makeApi(ws: string): Promise<ApiPromise> {
	const provider = new WsProvider(ws);
	const api = await ApiPromise.create({ provider });
	return api
}

export async function scrape(account: string, api: ApiPromise): Promise<Asset[]> {
	let assets: Asset[] = [];
	const chain = (await api.rpc.system.chain()).toString();

	try {
		if (api.query.system) {
			const system = await fetch_system(api, account, chain);
			assets = assets.concat(system)
		}

		if (api.query.crowdloanRewards) {
			const cRewards = await fetch_crowdloan_rewards(api, account, chain);
			assets = assets.concat(cRewards)
		}

		if (api.query.crowdloan) {
			const crowdloan = await fetch_crowdloan(api, account, chain);
			assets = assets.concat(crowdloan)
		}

		if (api.query.assets) {
			const _assets = await fetch_assets(api, account, chain);
			assets = assets.concat(_assets)
		}

		if (api.query.tokens) {
			const tokens = await fetch_tokens(api, account, chain);
			assets = assets.concat(tokens)
		}

		if (api.query.rewards) {
			const rewardPools = await fetch_reward_pools(api, account, chain);
			assets = assets.concat(rewardPools)
		}
	} catch (e) {
		console.error(e)
		// throw(e)
	}

	return assets
}