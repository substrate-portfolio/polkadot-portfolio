import { ApiPromise, WsProvider } from "@polkadot/api";
import '@polkadot/api-augment';
import { readFileSync } from "fs";
import { fetch_tokens, fetch_crowdloan_rewards, fetch_system, fetch_vesting, fetch_crowdloan, fetch_assets,  } from "./fetch"
import { PerAccount, PerChain, Summary } from "./types";
import { price_of } from "./utils";

export const SUBSTRATE_BASED_CHAINS = JSON.parse(readFileSync('accounts.json').toString());
export const api_registry: Map<string, ApiPromise> = new Map();


/**
 * Specification of a chain, as described in the JSON account file.
 */
interface ChainSpec {
	chain: string,
	overwrite_currency_name?: string,
	stashes: [string, string],
}

async function main() {
	// initialize `api_registry`.
	for (const uri in SUBSTRATE_BASED_CHAINS) {
		const {
			chain,
			overwrite_currency_name,
		}: ChainSpec = SUBSTRATE_BASED_CHAINS[uri];
		const provider = new WsProvider(uri);
		const api = await ApiPromise.create({ provider });
		const token_name = overwrite_currency_name ? overwrite_currency_name : chain.toLowerCase();
		console.log(`✅ Connected to node: ${uri} / chain ${chain} / decimals: ${api.registry.chainDecimals.toString()} / tokens ${api.registry.chainTokens} / [ss58: ${api.registry.chainSS58}]`);
		api_registry.set(token_name.toLowerCase(), api);
	}


	const all_chains: PerChain[] = [];
	for (const uri in SUBSTRATE_BASED_CHAINS) {
		const {
			chain,
			stashes,
			overwrite_currency_name,
		}: ChainSpec = SUBSTRATE_BASED_CHAINS[uri];
		const token_name = overwrite_currency_name ? overwrite_currency_name : chain.toLowerCase();
		const api = api_registry.get(token_name)!;
		const price = await price_of(token_name);
		const block_number = (await api.rpc.chain.getBlock()).block.header.number.toBn();

		const chain_accounts = [];
		for (const [account, name] of stashes) {
			const per_account = new PerAccount({ pallets: [], id: account, name });

			if (api.query.system) {
				const system = await fetch_system(api, account, token_name, price);
				per_account.pallets.push(system)
			}

			if (api.query.crowdloanRewards) {
				const system = await fetch_crowdloan_rewards(api, account, token_name, price);
				per_account.pallets.push(system)
			}

			if (api.query.vesting) {
				// @ts-ignore
				if (api.query.vesting.vesting) {
					const vesting = await fetch_vesting(api, account, block_number);
				}
			}

			if (api.query.crowdloan) {
				const crowdloan = await fetch_crowdloan(api, account, token_name, price);
				per_account.pallets.push(crowdloan)
			}

			if (api.query.assets) {
				const assets = await fetch_assets(api, account);
				per_account.pallets.push(assets);
			}

			if (api.query.tokens) {
				await fetch_tokens(api, account);
			}

			chain_accounts.push(per_account);
		}

		const chain_data = new PerChain({ accounts: chain_accounts, name: chain });
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

