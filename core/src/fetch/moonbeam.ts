import BN from 'bn.js';
import { IChain, IValueBearing } from '.';
import { Asset } from '../types';
import { tickerPrice } from '../utils';

export class MoonbeamCrowdloanRewards implements IValueBearing {
	identifiers: string[];
	addressLength: number;

	constructor() {
		this.addressLength = 20;
		this.identifiers = ["crowdloanRewards"];
	}

	async extract(chain: IChain, account: string): Promise<Asset[]> {
		const { api, name: chainName } = chain;
		const ticker = api.registry.chainTokens[0];
		const price = await tickerPrice(ticker);
		// really wacky way of decoding shit...
		const [_, total, claimed, _dont_care] = api.createType(
			'(U8, Balance, Balance, Vec<AccountId32>)',
			(await api.query.crowdloanRewards.accountsPayable(account)).toU8a()
		);
		const locked = total.sub(claimed);

		if (locked.isZero()) {
			return []
		}

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
