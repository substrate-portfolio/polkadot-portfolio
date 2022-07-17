import { ApiPromise } from '@polkadot/api';
import axios from 'axios';
import BN from 'bn.js';
import { Asset } from './types';

/**
 * Map a token name to chain name, because coingecko can only understand this.
 */
const COIN_CHAIN_MAP: Map<string, string> = new Map([
	['ksm', 'kusama'],
	['kar', 'karura'],
	['astr', 'astar'],
	['dot', 'polkadot'],
	['movr', 'moonriver'],
	['glmr', 'moonbeam'],
	['aca', 'acala'],
	['para', 'parallel'],
	['azero', 'aleph-zero'],
	['sub', 'subsocial'],
	['efi', 'efinity'],
	['cfg', 'centrifuge']
]);

const PRICE_CACHE: Map<string, number> = new Map();

export async function tickerPrice(ticker: string): Promise<number> {
	// cater for xc-tokens in moonbeam.
	if (ticker.startsWith('xc')) {
		ticker = ticker.slice(2);
	}

	const tokenTransformed = COIN_CHAIN_MAP.has(ticker.toLowerCase())
		? COIN_CHAIN_MAP.get(ticker.toLowerCase())!
		: ticker.toLowerCase();

	if (PRICE_CACHE.has(tokenTransformed)) {
		return PRICE_CACHE.get(tokenTransformed)!;
	}

	try {
		const data = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenTransformed}`);
		const price = data.data['market_data']['current_price']['eur'];
		PRICE_CACHE.set(tokenTransformed, price);
		console.log(`✅ got the price of ${tokenTransformed} as ${price}`);
		return price;
	} catch {
		PRICE_CACHE.set(tokenTransformed, 0);
		console.log(`⛔️ failed to get the price of ${tokenTransformed}`);
		return 0;
	}
}

export function findDecimals(api: ApiPromise, token: string): BN {
	const index = api.registry.chainTokens.findIndex((t) => t.toLowerCase() == token.toLowerCase());
	return index > -1 ? new BN(api.registry.chainDecimals[index]) : new BN(1);
}

export function currencyFormat(num: number, currency = 'EUR', locale = 'en-US'): string {
	const formatter = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	});
	return formatter.format(num);
}
