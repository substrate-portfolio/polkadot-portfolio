import { Asset, Summary, AssetOrigin } from "./types";
import { scrape } from './fetch';
import { currencyFormat, findDecimals, priceOf } from "./utils";
import { ApiPromise, WsProvider } from "@polkadot/api";

export async function makeApi(ws: string): Promise<ApiPromise> {
	const provider = new WsProvider(ws);
	const api = await ApiPromise.create({ provider });
	return api
}

export {
  Asset, Summary, AssetOrigin, scrape, currencyFormat, findDecimals, priceOf, ApiPromise
}

