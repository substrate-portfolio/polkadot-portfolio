import '@polkadot/api-augment';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Asset } from '../types';
import { Assets, System, ParachainCrowdloan } from "./substrate";
import { MoonbeamCrowdloanRewards } from "./moonbeam";
import { identity } from 'lodash';

export interface IChain {
	api: ApiPromise,
	name: string
}

export interface IValueBearing {
	identifier: string
	extract(chain: IChain, account: string): Promise<Asset[]>;
}

export async function makeApi(ws: string): Promise<ApiPromise> {
	const provider = new WsProvider(ws);
	const api = await ApiPromise.create({ provider });
	return api;
}

export async function scrape(account: string, api: ApiPromise): Promise<Asset[]> {
	let assets: Asset[] = [];
	const chain = (await api.rpc.system.chain()).toString();
	const valueBearingModules = [
		new System(), new Assets(), new ParachainCrowdloan(),
		new MoonbeamCrowdloanRewards(),
	];

	for (let mod of valueBearingModules) {
		const instances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), mod.identifier);
		console.log(chain, api.runtimeVersion.specName.toString(), mod.identifier, instances);

		if (api.query[mod.identifier]) {
			try {
				const moduleAssets = await mod.extract({ api, name: chain }, account);
				assets = assets.concat(moduleAssets);
			} catch (e) {
				console.error(`error while fetching ${mod.identifier} for ${account}:`, e);
				// throw(e)
			}
		}
	}

	return assets;
}
