import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { IChain, IValueBearing } from '.';
import { Asset } from '../types';
import { priceOf } from '../utils';

export class MoonbeamCrowdloanRewards implements IValueBearing {
	identifier: string;

	constructor() {
		this.identifier = "crowdloandRewards";
	}

	async extract(chain: IChain, account: string): Promise<Asset[]> {
		const { api, name: chainName } = chain;
		const ticker = api.registry.chainTokens[0];
		const price = await priceOf(ticker);
		// really wacky way of decoding shit...
		const [_, total, claimed, _dont_care] = api.createType(
			'(U8, Balance, Balance, Vec<AccountId32>)',
			(await api.query.crowdloanRewards.accountsPayable(account)).toU8a()
		);
		const locked = total.sub(claimed);

		const decimals = new BN(api.registry.chainDecimals[0]);
		return [
			new Asset({
				name: `crowdloan vested ${ticker}`,
				ticker,
				price,
				transferrable: false,
				amount: locked,
				decimals,
				origin: { account, chain: chainName, source: 'crowdloan rewards pallet' }
			})
		];
	}
}
