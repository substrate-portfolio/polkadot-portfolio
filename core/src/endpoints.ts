import {
	prodChains,
	prodRelayKusama,
	prodRelayPolkadot,
} from "./endpoint_dump";

export enum Ecosystem {
	Polkadot = "Polkadot",
	Kusama = "Kusama",
	None = "None"
}

export interface IChainEndpoint {
	name: string,
	ecosystem: Ecosystem,
	endpoints: Record<string, string>,
}

let allChains: IChainEndpoint[] = [];
const addChain = (e: any, ecosystem: Ecosystem) => allChains.push({ name: e.text, ecosystem, endpoints: e.providers })

// Polkadot stuff
addChain(prodRelayPolkadot, Ecosystem.Polkadot);
prodRelayPolkadot.linked?.forEach((e) => addChain(e, Ecosystem.Polkadot))

// Kusama stuff
addChain(prodRelayKusama, Ecosystem.Kusama);
prodRelayKusama.linked?.forEach((e) => addChain(e, Ecosystem.Kusama))

// everything else.
prodChains.forEach((e) => addChain(e, Ecosystem.None));

console.log(allChains);

