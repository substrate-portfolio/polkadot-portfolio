import { doesNotMatch } from 'assert';
import { allChains, scrape, makeApi } from '../src/index';

describe('allChain', () => {
	test('should not be empty', () => {
		expect(allChains.length).toBeGreaterThan(0);
	});
});

describe('scrape', () => {
	test('should fetch treasury account', async () => {
		const api = await makeApi('wss://rpc.polkadot.io');
		const assets = await scrape('13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB', api);
		expect(assets.length).toBeGreaterThan(0);
	});

	test('should fetch acala tokens', async () => {
		const api = await makeApi('wss://karura.api.onfinality.io/public-ws');
		const assets = await scrape('HL8bEp8YicBdrUmJocCAWVLKUaR2dd1y6jnD934pbre3un1', api);
		console.log(assets);
		expect(assets.length).toBeGreaterThan(1);
	});
});
