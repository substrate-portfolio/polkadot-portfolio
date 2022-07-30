import BN from 'bn.js';
import { IValueBearing, IChain } from '.';
import { Ecosystem, paraIdToName } from '../endpoints';
import { Asset } from '../types';
import { tickerPrice } from '../utils';

export class Account32ValueBearing {
	addressLength: number;

	constructor() {
		this.addressLength = 32;
	}
}

export class System extends Account32ValueBearing implements IValueBearing {
	identifiers: string[];

	constructor() {
		super();
		this.identifiers = ['system'];
	}

	async extract(chain: IChain, account: string): Promise<Asset[]> {
		const ticker = chain.api.registry.chainTokens[0];
		const price = await tickerPrice(ticker);
		const accountData = await chain.api.query.system.account(account);
		const decimals = new BN(chain.api.registry.chainDecimals[0]);

		const assets: Asset[] = [];
		if (!accountData.data.free.isZero()) {
			assets.push(
				new Asset({
					name: `free_${ticker}`,
					ticker,
					price,
					transferrable: true,
					amount: accountData.data.free || new BN(0),
					decimals,
					origin: { account, chain: chain.name, source: 'system pallet' }
				})
			);
		}
		if (!accountData.data.reserved.isZero()) {
			assets.push(
				new Asset({
					name: `reserved_${ticker}`,
					ticker,
					price,
					transferrable: false,
					amount: accountData.data.reserved || new BN(0),
					decimals,
					origin: { account, chain: chain.name, source: 'system pallet' }
				})
			);
		}
		return assets;
	}
}

export class ParachainCrowdloan extends Account32ValueBearing implements IValueBearing {
	identifiers: string[];

	constructor() {
		super();
		this.identifiers = ['paras', 'crowdloan'];
	}

	async extract(chain: IChain, account: string): Promise<Asset[]> {
		const { api, name: chainName } = chain;
		// assumption: this pallet only lives on the relay chains.
		const ecosystem = chainName.toLowerCase() == 'polkadot' ? Ecosystem.Polkadot : Ecosystem.Kusama;
		const ticker = api.registry.chainTokens[0];
		const price = await tickerPrice(ticker);
		const accountHex = api.createType('AccountId', account).toHex();
		const decimals = new BN(api.registry.chainDecimals[0]);
		const allParaIds: any[] = (await api.query.paras.paraLifecycles.entries()).map(
			([key, _]) => key.args[0]
		);
		const assets: Asset[] = [];
		const fetchParaIdPromise = allParaIds.map(async (id) => {
			const contribution = await api.derive.crowdloan.ownContributions(id, [accountHex]);
			if (contribution[accountHex]) {
				const contribution_amount = contribution[accountHex];
				if (!contribution_amount.isZero()) {
					const asset = new Asset({
						name: `crowdloan_${id}_${paraIdToName(Number(id), ecosystem)}`,
						ticker,
						price,
						transferrable: false,
						amount: contribution_amount,
						decimals,
						origin: { account, chain: chainName, source: 'crowdloan pallet' }
					});
					assets.push(asset);
				}
			}
		});

		await Promise.all(fetchParaIdPromise);

		return assets;
	}
}

export class Assets extends Account32ValueBearing implements IValueBearing {
	identifiers: string[];

	constructor() {
		super();
		this.identifiers = ['assets'];
	}

	async extract(chain: IChain, account: string): Promise<Asset[]> {
		const { api, name: chainName } = chain;
		const assets: Asset[] = [];
		const allAssetIds = (await api.query.assets.asset.entries()).map((a) => a[0].args[0]);
		const fetchAssetsPromise = allAssetIds.map(async (assetId) => {
			const assetAccount = await api.query.assets.account(assetId, account);
			if (assetAccount.isSome && !assetAccount.unwrap().balance.isZero()) {
				const meta = await api.query.assets.metadata(assetId);
				const decimals = new BN(meta.decimals);
				const ticker = (meta.symbol.toHuman() || '').toString();
				const price = await tickerPrice(ticker);
				assets.push(
					new Asset({
						ticker,
						name: ticker,
						price,
						transferrable: Boolean(assetAccount.unwrap().isFrozen),
						amount: assetAccount.unwrap().balance,
						decimals,
						origin: { account, chain: chainName, source: 'assets pallet' }
					})
				);
			}
		});
		await Promise.all(fetchAssetsPromise);

		return assets;
	}
}
