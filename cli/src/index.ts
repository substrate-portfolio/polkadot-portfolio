import { readFileSync } from 'fs';
import { tickerPrice, scrape, Asset, ApiPromise, makeApi } from 'polkadot-portfolio-core';
import * as BN from "bn.js";
import * as currencyFormatter from 'currency-formatter';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface AccountsConfig {
	networks: string[];
	stashes: [string, string][];
}

const optionsPromise = yargs(hideBin(process.argv)).option('accounts', {
	alias: 'a',
	type: 'string',
	description: 'path to a JSON file with your accounts in it.',
	required: true
}).argv;


interface AssetAndRatio {
	asset: Asset;
	ratio: number;
}

class Summary {
	assets: Map<string, AssetAndRatio>;
	total_eur_value: number;

	constructor(input_assets: Asset[]) {
		const assets: Map<string, AssetAndRatio> = new Map();
		for (const asset of input_assets) {
			if (!asset.amount.isZero()) {
				if (assets.has(asset.ticker)) {
					const { asset: cumulative, ratio } = assets.get(asset.ticker) || {
						asset: asset,
						ratio: 0
					};
					cumulative.amount = cumulative.amount.add(asset.amount);
					assets.set(asset.ticker, { asset: cumulative, ratio: 0 });
				} else {
					const copy: Asset = new Asset({ ...asset });
					assets.set(asset.ticker, { asset: copy, ratio: 0 });
				}
			}
		}

		// compute sum of EUR-value in the entire map, and assign new ratio to each.
		let total_eur_value = 0;
		assets.forEach(({ asset }) => (total_eur_value = total_eur_value + asset.euroValue()));

		for (const asset_id of assets.keys()) {
			// just a wacky way to tell TS that the map def. contains `asset_id`:
			// https://typescript-eslint.io/rules/no-non-null-assertion/
			// https://linguinecode.com/post/how-to-solve-typescript-possibly-undefined-value
			const { asset, ratio: _prev_raio } = assets.get(asset_id)!;
			const new_ratio = asset.euroValue() / total_eur_value;
			assets.set(asset_id, { asset, ratio: new_ratio });
		}

		this.total_eur_value = total_eur_value;
		this.assets = assets;
	}

	stringify(): string {
		let ret = '';
		const sorted = Array.from(this.assets.entries())
			.sort((a, b) => a[1].ratio - b[1].ratio)
			.reverse();
		for (const [_, { asset: sum_asset, ratio }] of sorted) {
			ret += `🎁 sum of ${sum_asset.ticker}: ${formatAmount(sum_asset)}, ${(
				ratio * 100
			).toFixed(2)}% of total [unit price = ${sum_asset.price}].\n`;
		}
		ret += `💰 total EUR value: ${currencyFormatter.format(this.total_eur_value, {
			locale: 'nl-NL'
		})}\n`;
		return ret;
	}
}



function formatAmount(asset: Asset): string {
	const formatNumber = (x: BN) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	const token_amount = `${formatNumber(asset.decimal())}.${asset.fraction()
		.toString()
		.padStart(3, '0')}`;
	const eur_amount = asset.euroValue();
	return `${token_amount} - ${currencyFormatter.format(eur_amount, { locale: 'nl-NL' })}`;
}

function stringifyAsset(asset: Asset): string {
	return `[${asset.transferrable ? '🍺' : '🔐'}][${asset.ticker}] ${asset.name}: ${formatAmount(asset)}`;
}

export async function main() {
	const apiRegistry: Map<string, ApiPromise> = new Map<string, ApiPromise>();
	// initialize `apiRegistry`.
	const options = await optionsPromise;
	const accountConfig: AccountsConfig = JSON.parse(readFileSync(options.accounts).toString());

	// connect to all api endpoints.
	await Promise.all(
		accountConfig.networks.map(async (uri: string) => {
			const api = await makeApi(uri);
			apiRegistry.set(uri, api);
			console.log(
				`✅ Connected to ${uri} / decimals: ${api.registry.chainDecimals.toString()} / tokens ${api.registry.chainTokens
				} / [ss58: ${api.registry.chainSS58}]`
			);
			// this will just cache everything.
			const _price = await tickerPrice(api.registry.chainTokens[0]);
			apiRegistry.set(uri, api);
		})
	);

	let allAssets: Asset[] = [];
	for (const networkWs of accountConfig.networks) {
		const api = apiRegistry.get(networkWs)!;
		(
			await Promise.all(
				accountConfig.stashes.map(([account, name]) => {
					return scrape(account, api);
				})
			)
		).forEach((accountAssets) => (allAssets = allAssets.concat(accountAssets)));
	}

	accountConfig.stashes.forEach(([account, name]) => {
		const accountAssets = allAssets.filter((a) => a.origin.account === account);
		console.log(`#########`);
		console.log(`# Summary of ${account} / ${name}:`);
		for (let asset of accountAssets) {
			console.log(stringifyAsset(asset))
		}
		console.log(`#########`);
	});

	for (const networkWs of accountConfig.networks) {
		const api = apiRegistry.get(networkWs)!;
		const chain = (await api.rpc.system.chain()).toString();
		const chainAssets = allAssets.filter((a) => a.origin.chain === chain);
		console.log(`#########`);
		console.log(`# Summary of chain ${chain}:`);
		for (let asset of chainAssets) {
			console.log(stringifyAsset(asset))
		}
		console.log(`#########`);
	}

	const finalSummary = new Summary(allAssets);
	console.log(`#########`);
	console.log(`# Final Summary:\n${finalSummary.stringify()}`);
	console.log(`#########`);
}

main()
	.catch(console.error)
	.finally(() => process.exit());
