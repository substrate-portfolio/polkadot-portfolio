import { IValueBearing, IChain } from '.';
import { Ecosystem, paraIdToName } from '../endpoints';
import { Asset } from '../types';
import { tickerPrice } from '../utils';
import { u32, u128 } from '@polkadot/types';
import { ApiPromise } from '@polkadot/api';
import { AccountId32, FixedU128 } from '@open-web3/orml-types/interfaces';
import { BN, bnToU8a, stringToU8a, u8aConcat } from '@polkadot/util';
import { PalletNominationPoolsRewardPool } from '@polkadot/types/lookup';
import { memberExpression } from '@babel/types';

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
					name: `free ${ticker}`,
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
					name: `reserved ${ticker}`,
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
						name: `${paraIdToName(Number(id), ecosystem)} (${id}) crowdloan`,
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

export class NominationPools extends Account32ValueBearing implements IValueBearing {
	identifiers: string[];
	rewardCounterBase: number;

	constructor() {
		super();
		this.identifiers = ['nominationPools'];
		this.rewardCounterBase = 1_000_000_000_000_000_000;
	}

	async extract(chain: IChain, account: string): Promise<Asset[]> {
		const { api, name: chainName } = chain;
		const assets: Asset[] = [];
		const maybeMember = await api.query.nominationPools.poolMembers(account);
		if (maybeMember.isSome) {
			const ticker = chain.api.registry.chainTokens[0];
			const price = await tickerPrice(ticker);
			const decimals = new BN(chain.api.registry.chainDecimals[0]);

			const member = maybeMember.unwrap();
			const points = member.points;
			const bondedPool = (await api.query.nominationPools.bondedPools(member.poolId)).unwrap();

			const pointsToBalance = async (points: BN): Promise<BN> => {
				const bondedAccount = this.createAccount(
					api,
					api.consts.nominationPools.palletId.toU8a(),
					member.poolId,
					0
				);
				const bondedBalance = (await api.query.staking.ledger(bondedAccount))
					.unwrap()
					.active.toBn();
				return points.mul(bondedBalance).div(bondedPool.points);
			};

			// get the bonded amount
			const amount = await pointsToBalance(points);
			assets.push(
				new Asset({
					ticker,
					name: `Bonded (nom-pools)`,
					price,
					transferrable: false,
					amount,
					decimals,
					origin: { account, chain: chainName, source: 'nomination pools pallet' }
				})
			);

			// get any unbonding amount
			for (const [era, pointsUnbonding] of member.unbondingEras.entries()) {
				const unbondingPool = (
					await api.query.nominationPools.subPoolsStorage(member.poolId)
				).unwrap();
				let amount = new BN(0);
				if (unbondingPool.withEra.has(era)) {
					const points = unbondingPool.withEra.get(era)!.points;
					const balance = unbondingPool.withEra.get(era)!.balance;
					amount = pointsUnbonding.mul(balance).div(points);
				} else {
					const points = unbondingPool.noEra.points;
					const balance = unbondingPool.noEra.balance;
					amount = pointsUnbonding.mul(balance).div(points);
				}
				assets.push(
					new Asset({
						ticker,
						name: `Pool Unlocking @${era}`,
						price,
						transferrable: false,
						amount,
						decimals,
						origin: { account, chain: chainName, source: 'nomination pools pallet' }
					})
				);
			}

			// get any pending rewards
			const rewardPool = (await api.query.nominationPools.rewardPools(member.poolId)).unwrap();
			console.log(rewardPool.toHuman());
			const currentRewardCounter = await this.currentRewardCounter(
				api,
				member.poolId,
				bondedPool.points,
				rewardPool
			);
			const pendingReward =
				(currentRewardCounter -
					member.lastRecordedRewardCounter.toNumber() / this.rewardCounterBase) *
				member.points;

			if (pendingReward !== 0) {
				assets.push(
					new Asset({
						ticker,
						name: `Pool Pending Reward`,
						price,
						transferrable: false,
						amount: new BN(pendingReward),
						decimals,
						origin: { account, chain: chainName, source: 'nomination pools pallet' }
					})
				);
			}
		}

		return assets;
	}

	async currentRewardCounter(
		api: ApiPromise,
		id: u32,
		bondedPoints: u128,
		rewardPool: PalletNominationPoolsRewardPool
	): Promise<number> {
		// https://github.com/paritytech/substrate/blob/4c83ee0a406939f1393d19f87675e1fbc49e328d/frame/nomination-pools/src/lib.rs#L968
		const rewardAccount = this.createAccount(
			api,
			api.consts.nominationPools.palletId.toU8a(),
			id,
			1
		);
		const existentialDeposit = api.consts.balances.existentialDeposit;
		const balance = (await api.query.system.account(rewardAccount)).data.free.sub(
			existentialDeposit
		);
		const payoutSinceLastRecord = balance
			.add(new BN(rewardPool.totalRewardsClaimed))
			.sub(new BN(rewardPool.lastRecordedTotalPayouts));

		// we know that the RC in all chains is fixedu128, which has a base of
		return (
			payoutSinceLastRecord.toNumber() / bondedPoints.toNumber() +
			rewardPool.lastRecordedRewardCounter.toNumber() / this.rewardCounterBase
		);
	}

	createAccount(api: ApiPromise, palletId: Uint8Array, poolId: BN, index: number): AccountId32 {
		const EMPTY_H256 = new Uint8Array(32);
		const MOD_PREFIX = stringToU8a('modl');
		const U32_OPTS = { bitLength: 32, isLe: true };
		return api.registry.createType(
			'AccountId32',
			u8aConcat(
				MOD_PREFIX,
				palletId,
				new Uint8Array([index]),
				bnToU8a(poolId, U32_OPTS),
				EMPTY_H256
			)
		);
	}
}
