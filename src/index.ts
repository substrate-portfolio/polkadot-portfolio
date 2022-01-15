import { ApiPromise, WsProvider } from "@polkadot/api";
import '@polkadot/api-augment';
import { ParaId } from "@polkadot/types/interfaces"
import { PalletAssetsAssetAccount } from "@polkadot/types/lookup"
import { BN } from "@polkadot/util";
import { strict as assert } from "assert/strict";
import axios from "axios";
import * as currencyFormatter from "currency-formatter";
import { readFileSync } from "fs";

import { typesBundlePre900 } from "moonbeam-types-bundle"


interface Chain {
	chain: string,
	overwrite_currency_name?: string,
	stashes: [string, string],
	pallets: string[]
}

interface Asset {
	amount: BN,
	transferrable: boolean,
	name: string,
	price_cents: BN,
	decimals: BN,
}

interface PerPallet {
	name: string,
	assets: Asset[]
}

interface PerAccount {
	id: string,
	name: string,
	tokens: PerPallet[],
}

interface PerChain {
	name: string
	accounts: PerAccount[]
}

const SUBSTRATE_BASED_CHAINS = JSON.parse(readFileSync('accounts.json').toString())

async function price_of(token: string): Promise<BN> {
	try {
		const data = await axios.get(`https://api.coingecko.com/api/v3/coins/${token}`);
		const price = data.data['market_data']['current_price']['eur'];
		return new BN(price * 100)
	} catch {
		console.log(`⛔️ failed to get the price of ${token}`)
		return new BN(0)
	}
}

async function fetch_vesting(api: ApiPromise, account: string, block_number: BN): Promise<PerPallet> {
	const accountData = await api.query.system.account(account);
	const vesting = (await api.query.vesting.vesting(account)).unwrapOrDefault();
	const totalBalance = accountData.data.free.add(accountData.data.reserved);
	assert.ok(vesting.length <= 1);
	if (vesting.length === 1) {
		const schedule = vesting[0];
		const nonVested = totalBalance.sub(schedule.locked);
		const madeFree = (block_number.sub(schedule.startingBlock)).mul(schedule.perBlock);
		const leftVesting = schedule.locked.sub(madeFree);
	}

	return { assets: [], name: "vesting" }
}

async function fetch_system(api: ApiPromise, account: string, token_name: string, price_cents: BN): Promise<PerPallet> {
	const accountData = await api.query.system.account(account);
	const decimals = new BN(api.registry.chainDecimals[0]);
	const assets: Asset[] = [
		{ name: `free_${token_name}`, price_cents, transferrable: true, amount: accountData.data.free, decimals  },
		{ name: `reserved_${token_name}`, price_cents, transferrable: false, amount: accountData.data.reserved, decimals  }
	];
	return { assets, name: "system" }
}

async function fetch_crowdloan(api: ApiPromise, account: string, token_name: string, price_cents: BN): Promise<PerPallet> {
	const accountHex = api.createType('AccountId', account).toHex();
	// @ts-ignore
	const allParaIds: ParaId[] = (await api.query.paras.paraLifecycles.entries()).map(([key, _]) => key.args[0]);
	let sum = new BN(0);
	for (const id of allParaIds) {
		const contribution = await api.derive.crowdloan.ownContributions(id, [accountHex])
		// console.log(`cont to ${id}: ${Object.keys(contribution)}, ${Object.values(contribution)}`)
		if (contribution[accountHex]) {
			const contribution_amount = contribution[accountHex];
			if (!contribution_amount.isZero()) {
				sum = sum.add(contribution_amount);
			}
		}
	}

	const decimals = new BN(api.registry.chainDecimals[0]);
	const assets: Asset[] = [{ name: token_name, price_cents, transferrable: false, amount: sum, decimals }]
	return { assets, name: "crowdloan" }
}

async function fetch_crowdloan_rewards(api: ApiPromise, account: string, token_name: string, price_cents: BN): Promise<PerPallet> {
	// really wacky way of decoding shit...
	// @ts-ignore
	const [_, total, claimed, _dont_care] = api.createType(
		'(U8, Balance, Balance, Vec<AccountId32>)',
		(await api.query.crowdloanRewards.accountsPayable(account)).toU8a(),
	);
	const locked = total.sub(claimed);

	const decimals = new BN(api.registry.chainDecimals[0]);
	return { assets: [ { name: token_name, price_cents, transferrable: false, amount: locked, decimals }], name: "crowdloanRewards" }
}

async function fetch_assets(api: ApiPromise, account: string): Promise<PerPallet> {
	const assets: Asset[] = [];
	const allAssetIds = (await api.query.assets.asset.entries()).map((a) => a[0].args[0]);
	for (const assetId of allAssetIds) {
		// @ts-ignore
		const assetAccount: PalletAssetsAssetAccount = await api.query.assets.account(assetId, account);
		if (!assetAccount.balance.isZero()) {
			const meta = await api.query.assets.metadata(assetId);
			const decimals = new BN(meta.decimals);
			const name = (meta.symbol.toHuman() || "").toString().toLowerCase() ;
			const price_cents = await price_of(name);
			assets.push( { name, price_cents, transferrable: Boolean(assetAccount.isFrozen), amount: assetAccount.balance, decimals, })
		}
	}

	return { assets, name: "assets" }
}

function display(api: ApiPromise, per_chain: PerChain) {
	for (const account of per_chain.accounts) {
		for (const pallet of account.tokens) {
			for (const asset of pallet.assets) {
				if (!asset.amount.isZero()) {
					console.log(`📊 [${asset.transferrable? '🍺': '🔐'}] ${asset.name}::${pallet.name}::${account.name}: ${format_asset(api, asset.amount, asset.price_cents, asset.decimals)}`)
				}
			}
		}
	}
}

function format_asset(api: ApiPromise, amount: BN, price_cents: BN, decimals: BN): string {
	const token_amount = api.createType('Balance', amount).toHuman().toString();
	const token_amount_raw = amount.div(decimals)
	const eur_amount = amount.mul(price_cents.div(new BN(100))).div(new BN(10).pow(decimals)).toNumber();
	return `${token_amount} - ${currencyFormatter.format(eur_amount, { locale: "nl-NL" })}`
}

async function main() {
	const all: PerChain[] = [];
	for (const uri in SUBSTRATE_BASED_CHAINS) {
		// @ts-ignore
		const {
			chain,
			stashes,
			overwrite_currency_name,
			pallets,
		}: Chain = SUBSTRATE_BASED_CHAINS[uri];
		const provider = new WsProvider(uri);
		// @ts-ignore
		const api = await ApiPromise.create({ provider, typesBundle: typesBundlePre900 });
		const token_name = overwrite_currency_name ? overwrite_currency_name : chain.toLowerCase();
		const price_cents = await price_of(token_name);
		const block_number = (await api.rpc.chain.getBlock()).block.header.number.toBn();

		console.log(`✅ Connected to node: ${uri} / chain ${chain} / decimals: ${api.registry.chainDecimals.toString()} / tokens ${api.registry.chainTokens} / at #${block_number} [ss58: ${api.registry.chainSS58}][current price :${price_cents} cents]`);


		const chain_accounts = [];
		for (const [account, name] of stashes) {
			// account balance.
			const per_account: PerAccount = { tokens: [], id: account, name };

			if (pallets.indexOf('system') > -1 && api.query.system ) {
				const system = await fetch_system(api, account, token_name, price_cents);
				per_account.tokens.push(system)
			}

			if (pallets.indexOf('crowdloanRewards') > -1 && api.query.crowdloanRewards ) {
				const system = await fetch_crowdloan_rewards(api, account, token_name, price_cents);
				per_account.tokens.push(system)
			}

			// vesting stuff
			if (pallets.indexOf('vesting') > -1 && api.query.vesting && api.query.vesting.vesting) {
				const vesting = await fetch_vesting(api, account, block_number);
			}

			// crowdloan stuff
			if (pallets.indexOf('crowdloan') > -1 && api.query.crowdloan) {
				const crowdloan = await fetch_crowdloan(api, account, token_name, price_cents);
				per_account.tokens.push(crowdloan)
			}

			// assets
			if (pallets.indexOf('assets') > -1 && api.query.assets) {
				const assets = await fetch_assets(api, account);
				per_account.tokens.push(assets);
			}

			chain_accounts.push(per_account);
		}

		display(api, { accounts: chain_accounts, name: chain });
	}
}

main().catch(console.error).finally(() => process.exit());

