import { PerAccount } from "./Account";

export class PerChain {
	name: string;
	accounts: PerAccount[];

	constructor(chain: IPerChain) {
		this.name = chain.name;
		this.accounts = chain.accounts;
	}
}

interface IPerChain {
	name: string
	accounts: PerAccount[]
}
