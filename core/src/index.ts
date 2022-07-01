import "@polkadot/api-augment";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { readFileSync } from "fs";
import { fetch_tokens, fetch_crowdloan_rewards, fetch_system, fetch_crowdloan, fetch_assets, fetch_reward_pools,  } from "./fetch"
import { Asset, Summary } from "./types";
import yargs from 'yargs';
import { hideBin } from "yargs/helpers"
import { priceOf } from "./utils";

const optionsPromise = yargs(hideBin(process.argv))
	.option('accounts', {
		alias: 'a',
		type: 'string',
		description: 'path to a JSON file with your accounts in it.',
		required: true,
	})
	.argv

export const apiRegistry: Map<string, ApiPromise> = new Map();

/**
 * Specification of a chain, as described in the JSON account file.
 */
interface AccountsConfig {
	networks: string[],
	stashes: [string, string][],
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
	} catch(e) {
		// console.error(`error while fetching ${account}/${name} on ${nativeToken}: ${e}`);
		// throw(e)
	}

	return assets
}

async function main() {
	// initialize `apiRegistry`.
	const options = await optionsPromise;
	const accountConfig: AccountsConfig = JSON.parse(readFileSync(options.accounts).toString());

	// connect to all api endpoints.
	await Promise.all(accountConfig.networks.map(async (uri: string) => {
		const provider = new WsProvider(uri);
		const api = await ApiPromise.create({ provider });
		console.log(`✅ Connected to ${uri} / decimals: ${api.registry.chainDecimals.toString()} / tokens ${api.registry.chainTokens} / [ss58: ${api.registry.chainSS58}]`);
		// this will just cache everything.
		const _price = await priceOf(api.registry.chainTokens[0]);
		apiRegistry.set(uri, api);
	}));

	let allAssets: Asset[] = [];
	for (const networkWs of accountConfig.networks) {
		const api = apiRegistry.get(networkWs)!;
		(await Promise.all(accountConfig.stashes.map(([account, name]) => {
			return scrape(account, api);
		}))).forEach((accountAssets) => allAssets = allAssets.concat(accountAssets))
	}

	accountConfig.stashes.forEach(([account, name]) => {
		const accountAssets = allAssets.filter((a) => a.origin.account == account);
		const summary = new Summary(accountAssets);
		console.log(`#########`)
		console.log(`# Summary of ${account} / ${name}:\n${summary.stringify()}`)
		console.log(`#########`)
	})

	for (const networkWs of accountConfig.networks) {
		const api = apiRegistry.get(networkWs)!;
		const chain = (await api.rpc.system.chain()).toString();
		const chainAssets = allAssets.filter((a) => a.origin.chain == chain);
		const summary = new Summary(chainAssets);
		console.log(`#########`)
		console.log(`# Summary of chain ${chain} :\n${summary.stringify()}`)
		console.log(`#########`)
	}

	const finalSummary = new Summary(allAssets);
	console.log(`#########`)
	console.log(`# Final Summary:\n${finalSummary.stringify()}`)
	console.log(`#########`)
}

main().catch(console.error).finally(() => process.exit());

