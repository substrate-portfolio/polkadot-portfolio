import { ApiPromise, WsProvider } from "@polkadot/api";
import '@polkadot/api-augment';
import { readFileSync } from "fs";
import { fetch_tokens, fetch_crowdloan_rewards, fetch_system, fetch_vesting, fetch_crowdloan, fetch_assets, fetch_reward_pools,  } from "./fetch"
import { PerAccount, PerChain, Summary } from "./types";
import { priceOf } from "./utils";
import yargs, { config } from 'yargs';
import { hideBin } from "yargs/helpers"

const optionsPromise = yargs(hideBin(process.argv))
	.option('accounts', {
		alias: 'a',
		type: 'string',
		description: 'path to a JSON file with your accounts in it.',
		required: true,
	})
	.argv

export const api_registry: Map<string, ApiPromise> = new Map();

/**
 * Specification of a chain, as described in the JSON account file.
 */
interface ChainSpec {
	chain: string,
	stashes: [string, string],
}

async function main() {
	// initialize `api_registry`.
	const options = await optionsPromise;
	const accountConfig = JSON.parse(readFileSync(options.accounts).toString());
	for (const uri in accountConfig) {
		const {
			chain,
		}: ChainSpec = accountConfig[uri];
		const provider = new WsProvider(uri);
		const api = await ApiPromise.create({ provider });
		console.log(`✅ Connected to node: ${uri} / chain ${chain} / decimals: ${api.registry.chainDecimals.toString()} / tokens ${api.registry.chainTokens} / [ss58: ${api.registry.chainSS58}]`);
		api_registry.set(chain, api);
	}


	const all_chains: PerChain[] = [];
	for (const uri in accountConfig) {
		const {
			chain,
			stashes,
		}: ChainSpec = accountConfig[uri];
		const api = api_registry.get(chain)!;
		const nativeToken = api.registry.chainTokens[0];
		const price = await priceOf(nativeToken);


		const chain_accounts = [];
		for (const [account, name] of stashes) {
			const per_account = new PerAccount({ pallets: [], id: account, name });

			if (api.query.system) {
				const system = await fetch_system(api, account, nativeToken, price);
				per_account.pallets.push(system)
			}

			if (api.query.crowdloanRewards) {
				const system = await fetch_crowdloan_rewards(api, account, nativeToken, price);
				per_account.pallets.push(system)
			}

			if (api.query.vesting) {
				// const vesting = await fetch_vesting(api, account, block_number);
			}

			if (api.query.crowdloan) {
				const crowdloan = await fetch_crowdloan(api, account, nativeToken, price);
				per_account.pallets.push(crowdloan)
			}

			if (api.query.assets) {
				const assets = await fetch_assets(api, account);
				per_account.pallets.push(assets);
			}

			if (api.query.tokens) {
				const assets = await fetch_tokens(api, account);
				per_account.pallets.push(assets);
			}
			if (api.query.rewards) {
				const assets = await fetch_reward_pools(api, account);
				per_account.pallets.push(assets);
			}

			chain_accounts.push(per_account);
		}

		const chain_data = new PerChain({ accounts: chain_accounts, name: chain });
		console.log(`⛓ ${chain}:`)
		chain_data.display();
		all_chains.push(chain_data);
	}


	// UI MISHE
	const all_assets = all_chains.flatMap((chain) => chain.accounts.flatMap((account) => account.pallets.flatMap((pallet) => pallet.assets)));
	const final_summary = new Summary(all_assets);

	console.log(`#########`)
	console.log(`# Final Summary:\n${final_summary.stringify()}`)
	console.log(`#########`)
}

main().catch(console.error).finally(() => process.exit());

