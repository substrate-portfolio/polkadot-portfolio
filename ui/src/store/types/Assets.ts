import BN from "bn.js";
import currencyFormatter from "currency-formatter"

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
		const token_amount = `${formatNumber(this.decimalAmount())}.${this.perThousandsFraction().toString().padStart(3, '0')}`
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