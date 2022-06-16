import BN from "bn.js";
import * as currencyFormatter from "currency-formatter";

/// Origin of an asset.
export interface AssetOrigin {
	/// The owner.
	account: string,
	/// The chain to which it belongs.
	chain: string,
	/// The network address
	network: string,
	/// The source pallet from which this asset has been extracted.
	source: string,
}

interface IAsset {
	name: string,
	token_name: string,
	amount: BN,
	transferrable: boolean,
	price: number,
	decimals: BN,
	origin: AssetOrigin,
}

/// A value bearing asset, existing in some blockchain system.
export class Asset {
	/// The token name of this asset. Usually a 3-4 character ticker, e.g. BTC.
	token_name: string;
	/// Longer version of the name of this asset, e.g. Bitcoin.
	name: string;
	/// The amount of asset.
	amount: BN;
	/// The decimal points of this asset.
	decimals: BN;
	/// Indicates if this asset is transferrable or not.
	transferrable: boolean;
	/// Last known price of this asset.
	price: number;
	/// Origin details of the asset.
	origin: AssetOrigin;

	constructor(asset: IAsset) {
		this.name = asset.name;
		this.token_name = asset.token_name;
		this.amount = asset.amount;
		this.transferrable = asset.transferrable;
		this.amount = asset.amount;
		this.price = asset.price;
		this.decimals = asset.decimals;
		this.origin = asset.origin;
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

	numeric_amount(): number {
		return parseFloat(`${this.decimalAmount()}.${this.perThousandsFraction().toString()}`)
	}

	format_amount(): string {
		const formatNumber = (x: BN) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return `${formatNumber(this.decimalAmount())}.${this.perThousandsFraction().toString().padStart(3, '0')}`
	}
}