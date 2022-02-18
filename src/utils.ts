import { ApiPromise } from "@polkadot/api";
import axios from "axios";
import BN from "bn.js";

/**
 * Map a token name to chain name, because coingecko can only understand this.
 */
const COIN_CHAIN_MAP: Map<string, string> = new Map(
	[
		["ksm", "kusama"],
		["kar", "karura"],
		["astr", "astar"],
		["dot", "polkadot"],
		["movr", "moonriver"],
		["glmr", "moonbeam"],
		["aca", "acala"],
		["para", "parallel"]
	]
)

export async function priceOf(token: string): Promise<number> {
	const tokenTransformed = COIN_CHAIN_MAP.has(token.toLowerCase()) ? COIN_CHAIN_MAP.get(token.toLowerCase()) : token.toLowerCase();
	try {
		const data = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenTransformed}`);
		const price = data.data['market_data']['current_price']['eur'];
		return price
	} catch {
		console.log(`⛔️ failed to get the price of ${tokenTransformed}`)
		return 0
	}
}

export function findDecimals(api: ApiPromise, token: string): BN  {
	const index = api.registry.chainTokens.findIndex((t) => t.toLowerCase() == token.toLowerCase());
	return index > -1 ? new BN(api.registry.chainDecimals[index]): new BN(1);
}
