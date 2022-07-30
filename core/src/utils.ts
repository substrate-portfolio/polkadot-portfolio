import { ApiPromise } from '@polkadot/api';
import axios from 'axios';
import BN from 'bn.js';

const PRICE_CACHE: Map<string, number> = new Map();

// TODO: get rid of this. This is only here to fulfill coingecko's shitty API.
const COINGECKO_MAP: Map<string, string> = new Map([
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

const doGetPrice = async (query: string): Promise<number> => {
	try {
		const data = await axios.get(`https://api.coingecko.com/api/v3/coins/${query}`);
		const price = data.data['market_data']['current_price']['eur'];
		PRICE_CACHE.set(query, price);
		console.log(`💳 got the price of ${query} as ${price}`);
		return price;
	} catch (e) {
		PRICE_CACHE.set(query, 0);
		console.log(`⛔️ failed to get the price of ${query}: ${e}`);
		return 0;
	}
};

export async function queryPrice(whatever: string): Promise<number> {
	const tickerTry = await tickerPrice(whatever);
	if (tickerTry === 0) {
		return await chainPrice(whatever);
	} else {
		return tickerTry;
	}
}

export async function tickerPrice(ticker: string): Promise<number> {
	// cater for xc-tokens in moonbeam.
	if (ticker.startsWith('xc')) {
		ticker = ticker.slice(2);
	}

	const normalized = COINGECKO_MAP.has(ticker.toLowerCase())
		? COINGECKO_MAP.get(ticker.toLowerCase())!
		: ticker.toLowerCase();

	if (PRICE_CACHE.has(normalized)) {
		return PRICE_CACHE.get(normalized)!;
	}
	return await doGetPrice(normalized);
}

export async function chainPrice(chain: string): Promise<number> {
	const normalized = chain.toLowerCase();

	if (PRICE_CACHE.has(normalized)) {
		return PRICE_CACHE.get(normalized)!;
	}
	return await doGetPrice(normalized);
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
