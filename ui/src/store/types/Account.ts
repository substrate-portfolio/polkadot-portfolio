import { PerPallet } from "./Pallet";

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

	// TODO: add currency here and inside funcs default to EUR.
	totalValue(): number {
		return this.pallets.reduce((sum, pallet) => sum + pallet.totalValue(), 0)
	}
}

interface IPerAccount {
	id: string,
	name: string,
	pallets: PerPallet[],
}