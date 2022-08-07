import '@polkadot/api-augment';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Asset } from '../types';
import { Assets, System, ParachainCrowdloan, NominationPools } from './substrate';
import { MoonbeamCrowdloanRewards } from './moonbeam';
import { tickerPrice } from '../utils';
import { AcalaLPTokens, AcalaTokens } from './acala';

export interface IChain {
	api: ApiPromise;
	name: string;
}

export interface IValueBearing {
	identifiers: string[];
	addressLength: number;
	extract(chain: IChain, account: string): Promise<Asset[]>;
}

export async function makeApi(ws: string): Promise<IChain> {
	const provider = new WsProvider(ws);
	const api = await ApiPromise.create({ provider });

	const name = (await api.rpc.system.chain()).toString();
	// this will cache the price.
	const _price = await tickerPrice(api.registry.chainTokens[0]);

	return { api, name };
}

export function accountLengthCheck(
	api: ApiPromise,
	account: string,
	expectedLength: number
): boolean {
	try {
		return api.createType('AccountId', account).toU8a().length === expectedLength;
	} catch {
		return false;
	}
}

export async function scrape(account: string, api: ApiPromise): Promise<Asset[]> {
	let assets: Asset[] = [];
	const chain = (await api.rpc.system.chain()).toString();
	const valueBearingModules = [
		new System(),
		new Assets(),
		new ParachainCrowdloan(),
		new NominationPools(),
		new MoonbeamCrowdloanRewards(),
		new AcalaTokens(),
		new AcalaLPTokens()
	];

	for (const mod of valueBearingModules) {
		if (mod.identifiers.length === 0) {
			console.log(`❌ module ${JSON.stringify(mod)} has no identifier`);
		}
		// const instances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), mod.identifier);
		if (mod.identifiers.every((i) => api.query[i] !== undefined)) {
			try {
				const moduleAssets = await mod.extract({ api, name: chain }, account);
				assets = assets.concat(moduleAssets);
			} catch (e) {
				// console.warn(
				// 	`error while fetching ${mod.identifiers} for ${account} in chain ${chain}:`,
				// 	e
				// );
				// throw(e)
			}
		}
	}
	console.log(`✅ fetched ${account} from ${chain}, found ${assets.length} assets.`);

	return assets;
}
