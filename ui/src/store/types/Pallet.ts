import { Asset } from "./Assets";

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
}

interface IPerPallet {
	name: string,
	assets: Asset[]
}