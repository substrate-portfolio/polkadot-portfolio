import BN from "bn.js";
import * as currencyFormatter from "currency-formatter";
import { api_registry } from ".";

export class Summary {
	assets: Map<string, [Asset, number]>;
	total_eur_value: number;

	constructor(input_assets: Asset[]) {
		const assets: Map<string, [Asset, number]> = new Map();
		for (const asset of input_assets) {
			if (!asset.amount.isZero()) {
				if (assets.has(asset.token_name)) {
					const [cumulative, _] = assets.get(asset.token_name) || [asset, 0];
					cumulative.amount = cumulative.amount.add(asset.amount);
					assets.set(asset.token_name, [cumulative, 0]);
				} else {
					const copy: Asset = new Asset({ ...asset });

					assets.set(asset.token_name, [copy, 0]);
				}
			}
		}

		// compute sum of EUR-value in the entire map, and assign new ratio to each.
		let total_eur_value = 0;
		assets.forEach(([asset, _]) => total_eur_value = total_eur_value + asset.euroValue())

		for (const asset_id of assets.keys()) {
			// just a wacky way to tell TS that the map def. contains `asset_id`:
			// https://typescript-eslint.io/rules/no-non-null-assertion/
			// https://linguinecode.com/post/how-to-solve-typescript-possibly-undefined-value
			const [asset, _prev_raio] = assets.get(asset_id)!;
			const new_ratio = asset.euroValue() / total_eur_value;
			assets.set(asset_id, [asset, new_ratio])
		}

		this.total_eur_value = total_eur_value;
		this.assets = assets;
	}

	stringify(): string {
		let ret = ""
		for (const [_, [sum_asset, ratio]] of this.assets.entries()) {
			ret += `🎁 sum of ${sum_asset.token_name}: ${sum_asset.format_amount()}, ${(ratio * 100).toFixed(2)}% of total.\n`
		}
		ret += `💰 total EUR value: ${currencyFormatter.format(this.total_eur_value, { locale: "nl-NL" })}\n`
		return ret
	}
}

export class Asset {
	name: string;
	token_name: string;
	amount: BN;
	decimals: BN;
	transferrable: boolean;

	price: number;

	constructor(asset: IAsset) {
		this.name = asset.name;
		this.token_name = asset.token_name;
		this.amount = asset.amount;
		this.transferrable = asset.transferrable;
		this.amount = asset.amount;
		this.price = asset.price;
		this.decimals = asset.decimals;
	}

	decimalAmount(): BN {
		return this.amount.div(new BN(10).pow(this.decimals))
	}

	perThousandsFraction(): BN {
		return this.amount.div(new BN(10).pow(this.decimals.sub(new BN(3)))).mod(new BN(1000))
	}

	euroValue(): number {
		if (this.price === 0) { return 0; }
		const d = new BN(1000);
		const scaledValue = this.amount.mul(d).div(new BN(10).pow(this.decimals)).toNumber();
		return (scaledValue * this.price) / 1000
	}

	format_amount(): string {
		const formatNumber = (x: BN) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

		const token_amount = `${formatNumber(this.decimalAmount())}.${this.perThousandsFraction().toString().padStart(3, '0')} ${this.token_name}`
		const eur_amount = this.euroValue();
		return `${token_amount} - ${currencyFormatter.format(eur_amount, { locale: "nl-NL" })}`
	}

	stringify(): string {
		return `[${this.transferrable ? '🍺' : '🔐'}][${this.token_name}] ${this.name}: ${this.format_amount()}`
	}
}

interface IAsset {
	name: string,
	token_name: string,
	amount: BN,
	transferrable: boolean,
	price: number,
	decimals: BN,
}

export class PerPallet {
	name: string;
	assets: Asset[];

	constructor(per_pallet: IPerPallet) {
		this.name = per_pallet.name;
		this.assets = per_pallet.assets;
	}

	has_any_value(): boolean {
		return this.assets.filter((a) => !a.amount.isZero()).length > 0
	}

	into_summary(): Summary {
		return new Summary(this.assets)
	}
}

interface IPerPallet {
	name: string,
	assets: Asset[]
}

export class PerAccount {
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

	into_summary(): Summary {
		return new Summary(this.pallets.flatMap((p) => p.assets))
	}
}

interface IPerAccount {
	id: string,
	name: string,
	pallets: PerPallet[],
}

export class PerChain {
	name: string;
	accounts: PerAccount[];

	constructor(chain: IPerChain) {
		this.name = chain.name;
		this.accounts = chain.accounts;
	}

	display() {
		for (const account of this.accounts) {
			if (!account.has_any_value()) { continue }
			console.log(`🧾 Account: ${account.name} (${account.id})`)
			for (const pallet of account.pallets) {
				if (!pallet.has_any_value()) { continue }
				for (const asset of pallet.assets) {
					if (!asset.amount.isZero()) {
						console.log(`${asset.stringify()}`)
					}
				}
			}
		}

		console.log(this.into_summary().stringify())
	}

	into_summary(): Summary {
		return new Summary(this.accounts.flatMap((a) => a.pallets.flatMap((p) => p.assets)))
	}
}

interface IPerChain {
	name: string
	accounts: PerAccount[]
}
