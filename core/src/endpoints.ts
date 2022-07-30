import {
	prodChains,
	prodParasKusama,
	prodParasPolkadot,
	prodRelayKusama,
	prodRelayPolkadot
} from './endpoint_dump';

export enum Ecosystem {
	Polkadot = 'Polkadot',
	Kusama = 'Kusama',
	None = 'None'
}

export interface IChainEndpoint {
	name: string;
	ecosystem: Ecosystem;
	endpoints: Record<string, string>;
}

export const allChains: IChainEndpoint[] = [];
const addChain = (e: any, ecosystem: Ecosystem) =>
	allChains.push({ name: e.text, ecosystem, endpoints: e.providers });

// Polkadot stuff
addChain(prodRelayPolkadot, Ecosystem.Polkadot);
prodRelayPolkadot.linked?.forEach((e) => addChain(e, Ecosystem.Polkadot));

// Kusama stuff
addChain(prodRelayKusama, Ecosystem.Kusama);
prodRelayKusama.linked?.forEach((e) => addChain(e, Ecosystem.Kusama));

// everything else.
prodChains.forEach((e) => addChain(e, Ecosystem.None));

export function paraIdToName(id: number, ecosystem: Ecosystem): string | undefined {
	if (ecosystem == Ecosystem.Kusama) {
		const maybeChain = prodParasKusama.find((c) => {
			if (c.paraId && c.paraId === id) {
				return true;
			}
		});
		return maybeChain ? maybeChain.text : undefined;
	} else if (ecosystem == Ecosystem.Polkadot) {
		const maybeChain = prodParasPolkadot.find((c) => {
			if (c.paraId && c.paraId === id) {
				return true;
			}
		});
		return maybeChain ? maybeChain.text : undefined;
	} else {
		return undefined;
	}
}
