import { PerAccount } from "./Account";

export class PerChain {
	name: string;
	accounts: PerAccount[];

	constructor(chain: IPerChain) {
		this.name = chain.name;
		this.accounts = chain.accounts;
	}

	// TODO: Add currency here, default to Euro
	totalAssetValue() {
		return this.accounts.reduce((sum, item) => sum + item.totalValue(), 0)
	}
}

interface IPerChain {
	name: string
	accounts: PerAccount[]
}
