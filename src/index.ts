import { ApiPromise, WsProvider } from "@polkadot/api";
import '@polkadot/api-augment';
import { ParaId } from "@polkadot/types/interfaces"
import { PalletAssetsAssetAccount } from "@polkadot/types/lookup"
import { BN } from "@polkadot/util";
import { strict as assert } from "assert/strict";
import axios from "axios";
import * as currencyFormatter from "currency-formatter";
import { readFileSync } from "fs";


interface Chain {
	chain: string,
	overwrite_currency_name?: string,
	stashes: [string, string],
	pallets: string[]
}

class Asset {
	name: string;
	token_name: string;
	amount: BN;
	transferrable: boolean;
	is_native: boolean;
	price: number;
	decimals: BN;

	constructor(asset: IAsset) {
		this.name = asset.name;
		this.token_name = asset.token_name;
		this.amount = asset.amount;
		this.transferrable = asset.transferrable;
		this.amount = asset.amount;
		this.is_native = asset.is_native;
		this.price = asset.price;
		this.decimals = asset.decimals;
	}

	euro_value(): BN {
		return new BN(this.amount.div(new BN(10).pow(this.decimals)).toNumber() * this.price)
	}

	format_amount(api: ApiPromise):string {
		const token_amount = this.is_native ? api.createType('Balance', this.amount).toHuman().toString() : `${this.amount.div(this.decimals).toString()} ${this.token_name}`;
		const eur_amount = this.euro_value().toNumber();
		return `${token_amount} - ${currencyFormatter.format(eur_amount, { locale: "nl-NL" })}`
	}

	stringify(api: ApiPromise): string {
		return `[${this.transferrable? '🍺': '🔐'}][${this.token_name}] ${this.name}: ${this.format_amount(api)}`
	}
}

interface IAsset {
	name: string,
	token_name: string,
	amount: BN,
	transferrable: boolean,
	is_native: boolean,
	price: number,
	decimals: BN,
}

class PerPallet {
	name: string;
	assets: Asset[];

	constructor(per_pallet: IPerPallet) {
		this.name = per_pallet.name;
		this.assets = per_pallet.assets;
	}

	has_any_value(): boolean {
		return this.assets.filter((a) => !a.amount.isZero()).length > 0
	}
}
interface IPerPallet {
	name: string,
	assets: Asset[]
}

class PerAccount {
	id: string;
	name: string;
	pallets: PerPallet[];

	constructor(per_account: IPerAccount) {
		this.id = per_account.id;
		this.name = per_account.name;
		this.pallets = per_account.pallets;
	}

	has_any_value(): boolean {
		return this.pallets.filter((t) => t.has_any_value()).length > 0
	}
}

interface IPerAccount {
	id: string,
	name: string,
	pallets: PerPallet[],
}


class PerChain {
	name: string;
	accounts: PerAccount[];
	sum: Map<string, Asset>;

	constructor(chain: IPerChain) {
		this.name = chain.name;
		this.accounts = chain.accounts;
		this.sum = new Map();
	}

	display(api: ApiPromise) {
		for (const account of this.accounts) {
			if (!account.has_any_value()) { continue }
			console.log(`🧾 Account: ${account.name} (${account.id})`)
			for (const pallet of account.pallets) {
				if (!pallet.has_any_value()) { continue }
				if (pallet.assets.filter((a) => !a.amount.isZero()).length > 0) {
					pallet.assets.sort((a, b) => a.amount.cmp(b.amount))

				}
				for (const asset of pallet.assets) {
					if (!asset.amount.isZero()) {
						console.log(`${asset.stringify(api)}`)
					}
				}
			}
		}

		console.log(this.asset_sum_display(api))
	}

	sum_up_assets() {
		for (const account of this.accounts) {
			if (!account.has_any_value()) { continue }
			for (const pallet of account.pallets) {
				if (!pallet.has_any_value()) { continue }
				for (const asset of pallet.assets) {
					if (!asset.amount.isZero()) {
						this.register_asset_for_sum(asset);
					}
				}
			}
		}
	}

	register_asset_for_sum(asset: Asset) {
		if (this.sum.has(asset.token_name)) {
			const cumulative = this.sum.get(asset.token_name) || asset;
			cumulative.amount = cumulative.amount.add(asset.amount);
			this.sum.set(asset.token_name, cumulative);
		} else {
			const copy: Asset = new Asset( { ...asset } );
			this.sum.set(asset.token_name, copy);
		}
	}

	asset_sum_display(api: ApiPromise): string {
		let ret = ""
		for (const [_, sum_asset] of this.sum.entries()) {
			ret += `🎁 sum of ${sum_asset.token_name}: ${sum_asset.format_amount(api)}\n`
		}
		return ret
	}
}
interface IPerChain {
	name: string
	accounts: PerAccount[]
}

const SUBSTRATE_BASED_CHAINS = JSON.parse(readFileSync('accounts.json').toString())

async function price_of(token: string): Promise<number> {
	try {
		const data = await axios.get(`https://api.coingecko.com/api/v3/coins/${token}`);
		const price = data.data['market_data']['current_price']['eur'];
		return price
	} catch {
		console.log(`⛔️ failed to get the price of ${token}`)
		return 0
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

	return new PerPallet({ assets: [], name: "vesting" })
}

async function fetch_system(api: ApiPromise, account: string, token_name: string, price: number): Promise<PerPallet> {
	const accountData = await api.query.system.account(account);
	const decimals = new BN(api.registry.chainDecimals[0]);
	const assets: Asset[] = [
		new Asset({ name: `free`, token_name, price, transferrable: true, amount: accountData.data.free, decimals, is_native: true  }),
		new Asset({ name: `reserved`, token_name, price, transferrable: false, amount: accountData.data.reserved, decimals, is_native: true })
	];
	return new PerPallet({ assets, name: "system" })
}

async function fetch_crowdloan(api: ApiPromise, account: string, token_name: string, price: number): Promise<PerPallet> {
	const accountHex = api.createType('AccountId', account).toHex();
	// @ts-ignore
	const allParaIds: ParaId[] = (await api.query.paras.paraLifecycles.entries()).map(([key, _]) => key.args[0]);
	let sum = new BN(0);
	for (const id of allParaIds) {
		const contribution = await api.derive.crowdloan.ownContributions(id, [accountHex])
		if (contribution[accountHex]) {
			const contribution_amount = contribution[accountHex];
			if (!contribution_amount.isZero()) {
				sum = sum.add(contribution_amount);
			}
		}
	}

	const decimals = new BN(api.registry.chainDecimals[0]);
	const assets: Asset[] = [new Asset({ name: `crowdloan`, token_name, price, transferrable: false, amount: sum, decimals, is_native: true })]
	return new PerPallet({ assets, name: "crowdloan" })
}

async function fetch_crowdloan_rewards(api: ApiPromise, account: string, token_name: string, price: number): Promise<PerPallet> {
	// really wacky way of decoding shit...
	// @ts-ignore
	const [_, total, claimed, _dont_care] = api.createType(
		'(U8, Balance, Balance, Vec<AccountId32>)',
		(await api.query.crowdloanRewards.accountsPayable(account)).toU8a(),
	);
	const locked = total.sub(claimed);

	const decimals = new BN(api.registry.chainDecimals[0]);
	return new PerPallet({ assets: [new Asset({ name: token_name, token_name, price, transferrable: false, amount: locked, decimals, is_native: true })], name: "crowdloanRewards" })
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
			const price = await price_of(name);
			assets.push(new Asset({ name, price, token_name: name, transferrable: Boolean(assetAccount.isFrozen), amount: assetAccount.balance, decimals, is_native: false }))
		}
	}

	return new PerPallet({ assets, name: "assets" })
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
		const api = await ApiPromise.create({ provider });
		const token_name = overwrite_currency_name ? overwrite_currency_name : chain.toLowerCase();
		const price = await price_of(token_name);
		const block_number = (await api.rpc.chain.getBlock()).block.header.number.toBn();

		console.log(`✅ Connected to node: ${uri} / chain ${chain} / decimals: ${api.registry.chainDecimals.toString()} / tokens ${api.registry.chainTokens} / at #${block_number} [ss58: ${api.registry.chainSS58}][price €${price}]`);


		const chain_accounts = [];
		for (const [account, name] of stashes) {
			// account balance.
			const per_account = new PerAccount({ pallets: [], id: account, name });

			if (pallets.indexOf('system') > -1 && api.query.system ) {
				const system = await fetch_system(api, account, token_name, price);
				per_account.pallets.push(system)
			}

			if (pallets.indexOf('crowdloanRewards') > -1 && api.query.crowdloanRewards ) {
				const system = await fetch_crowdloan_rewards(api, account, token_name, price);
				per_account.pallets.push(system)
			}

			// vesting stuff
			if (pallets.indexOf('vesting') > -1 && api.query.vesting && api.query.vesting.vesting) {
				const vesting = await fetch_vesting(api, account, block_number);
			}

			// crowdloan stuff
			if (pallets.indexOf('crowdloan') > -1 && api.query.crowdloan) {
				const crowdloan = await fetch_crowdloan(api, account, token_name, price);
				per_account.pallets.push(crowdloan)
			}

			// assets
			if (pallets.indexOf('assets') > -1 && api.query.assets) {
				const assets = await fetch_assets(api, account);
				per_account.pallets.push(assets);
			}

			chain_accounts.push(per_account);
		}

		const chain_data = new PerChain({ accounts: chain_accounts, name: chain });
		chain_data.sum_up_assets();
		chain_data.display(api);
		all.push(chain_data);
	}

	let sum_eur = new BN(0);
	for (const chain of all) {
		for (const asset_sum of chain.sum.values()) {
			sum_eur = sum_eur.add(asset_sum.euro_value());
		}
	}

	console.log(`#########`)
	console.log(`# Portfolio sum: ${currencyFormatter.format(sum_eur.toNumber(), { locale: "nl-NL" })}`)
	console.log(`#########`)
}

main().catch(console.error).finally(() => process.exit());

