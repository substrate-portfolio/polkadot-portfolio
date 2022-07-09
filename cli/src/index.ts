import { readFileSync } from "fs";
import { priceOf } from "polkadot-portfolio-core";
import yargs from 'yargs';
import { hideBin } from "yargs/helpers"
import {scrape} from 'polkadot-portfolio-core'
import { Asset, Summary, ApiPromise, makeApi } from "polkadot-portfolio-core";

/**
* Specification of a chain, as described in the JSON account file.
*/
interface AccountsConfig {
	networks: string[],
	stashes: [string, string][],
}


const optionsPromise = yargs(hideBin(process.argv))
	.option('accounts', {
		alias: 'a',
		type: 'string',
		description: 'path to a JSON file with your accounts in it.',
		required: true,
	})
	.argv

export async function main() {
	const apiRegistry: Map<string, ApiPromise> = new Map<string, ApiPromise>();
	// initialize `apiRegistry`.
	const options = await optionsPromise;
	const accountConfig: AccountsConfig = JSON.parse(readFileSync(options.accounts).toString());

	// connect to all api endpoints.
	await Promise.all(accountConfig.networks.map(async (uri: string) => {
		const api = await makeApi(uri)
		apiRegistry.set(uri, api);
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
		const accountAssets = allAssets.filter((a) => a.origin.account === account);
		const summary = new Summary(accountAssets);
		console.log(`#########`)
		console.log(`# Summary of ${account} / ${name}:\n${summary.stringify()}`)
		console.log(`#########`)
	})

	for (const networkWs of accountConfig.networks) {
		const api = apiRegistry.get(networkWs)!;
		const chain = (await api.rpc.system.chain()).toString();
		const chainAssets = allAssets.filter((a) => a.origin.chain === chain);
		const summary = new Summary(chainAssets);
		console.log(`#########`)
		console.log(`# Summary of chain ${chain} :\n${summary.stringify()}`);
		console.log(`#########`);
	}

	const finalSummary = new Summary(allAssets);
	console.log(`#########`)
	console.log(`# Final Summary:\n${finalSummary.stringify()}`)
	console.log(`#########`)
}

main().catch(console.error).finally(() => process.exit());
