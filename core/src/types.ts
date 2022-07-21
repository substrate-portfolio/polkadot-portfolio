import BN from 'bn.js';
import { tickerPrice } from './utils';

/// Origin of an asset.
export interface AssetOrigin {
	/// The owner.
	account: string;
	/// The chain to which it belongs.
	chain: string;
	/// The source pallet from which this asset has been extracted.
	source: string;
}

interface IAsset {
	name: string;
	ticker: string;
	amount: BN;
	transferrable: boolean;
	price: number;
	decimals: BN;
	origin: AssetOrigin;
}

/// A value bearing asset, existing in some blockchain system.
export class Asset {
	/// The ticker of this asset. Usually a 3-4 character ticker, e.g. BTC.
	ticker: string;
	/// Longer version of the name of this asset, e.g. Bitcoin.
	name: string;
	/// The amount of asset.
	amount: BN;
	/// The decimal points of this asset.
	///
	/// For example, DOT has 10 decimal points, so when amount = 10^12, it is equal to 100 DOTs.
	///
	/// See `decimal()` and `fraction()` methods.
	decimals: BN;
	/// Indicates if this asset is transferrable or not.
	transferrable: boolean;
	/// Last known price of this asset.
	price: number;
	/// Origin details of the asset.
	origin: AssetOrigin;

	constructor(asset: IAsset) {
		this.name = asset.name;
		this.ticker = asset.ticker;
		this.amount = asset.amount;
		this.transferrable = asset.transferrable;
		this.amount = asset.amount;
		this.price = asset.price;
		this.decimals = asset.decimals;
		this.origin = asset.origin;
	}

	/// Refresh the price of this asset. Updated `this.price`.
	async refreshPrice() {
		this.price = await tickerPrice(this.ticker);
	}

	// the decimal part of the amount, e.g. `123` in `123.xxx`
	decimal(): BN {
		return this.amount.div(new BN(10).pow(this.decimals));
	}

	// the (per-thousand) fractional part of the amount, e.g. `123` in `x.123`
	fraction(): BN {
		return this.amount.div(new BN(10).pow(this.decimals.sub(new BN(3)))).mod(new BN(1000));
	}

	// combination of `decimal` and `fraction`, returned as a float number.
	floatAmount(): number {
		return parseFloat(`${this.decimal()}.${this.fraction().toString()}`);
	}

	euroValue(): number {
		if (this.price === 0) {
			return 0;
		}
		const d = new BN(1000);
		const scaledValue = this.amount.mul(d).div(new BN(10).pow(this.decimals)).toNumber();
		return (scaledValue * this.price) / 1000;
	}
}
