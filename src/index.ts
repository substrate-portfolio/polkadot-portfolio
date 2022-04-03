import { ApiPromise, WsProvider } from "@polkadot/api";
import '@polkadot/api-augment';
import { readFileSync } from "fs";
import { fetch_tokens, fetch_crowdloan_rewards, fetch_system, fetch_crowdloan, fetch_assets, fetch_reward_pools,  } from "./fetch"
import { PerAccount, PerChain, Summary } from "./types";
import { priceOf } from "./utils";
import yargs from 'yargs';
import { hideBin } from "yargs/helpers"

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

async function scrapeAccountFunds(account: string, name: string, nativeToken: string, price: number, api: ApiPromise): Promise<PerAccount> {
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
		throw(e)
	}

	return perAccount
}

async function main() {
	// initialize `apiRegistry`.
	const options = await optionsPromise;
	const accountConfig: AccountsConfig = JSON.parse(readFileSync(options.accounts).toString());
	await Promise.all(accountConfig.networks.map(async (uri: string) => {
		const provider = new WsProvider(uri);
		const api = await ApiPromise.create({ provider });
		console.log(`✅ Connected to ${uri} / decimals: ${api.registry.chainDecimals.toString()} / tokens ${api.registry.chainTokens} / [ss58: ${api.registry.chainSS58}]`);
		apiRegistry.set(uri, api);
	}));

	const all_chains: PerChain[] = [];
	for (const networkWs of accountConfig.networks) {
		const api = apiRegistry.get(networkWs)!;
		const chain = (await api.rpc.system.chain()).toLowerCase();

		const nativeToken = api.registry.chainTokens[0];
		const price = await priceOf(nativeToken);

		const chainAccounts: PerAccount[] = [];
		(await Promise.all(accountConfig.stashes.map(([account, name]) => {
			return scrapeAccountFunds(account, name, nativeToken, price, api)
		}))).forEach((perAccount) => chainAccounts.push(perAccount))

		const chainData = new PerChain({ accounts: chainAccounts, name: chain });
		console.log(`⛓ ${chain}:`)
		chainData.display();
		all_chains.push(chainData);
	}


	// UI MISHE
	const all_assets = all_chains.flatMap((chain) => chain.accounts.flatMap((account) => account.pallets.flatMap((pallet) => pallet.assets)));
	const final_summary = new Summary(all_assets);

	console.log(`#########`)
	console.log(`# Final Summary:\n${final_summary.stringify()}`)
	console.log(`#########`)
}

main().catch(console.error).finally(() => process.exit());

