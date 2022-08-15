import { Asset } from 'polkadot-portfolio-core';
import { AssetGroups } from '../../utils/constants';

export default class GroupedAsset {
	assets: Asset[];
	identifier: string;
	type: AssetGroups;
	transferableAssets: Asset[];
	floatValue: number;
	euroValue: number;

	constructor(assets: Asset[], identifier: string, type: AssetGroups) {
		this.assets = assets;
		this.identifier = identifier;
		this.type = type;
		this.floatValue = this.calculateFloatValue(assets);
		this.euroValue = this.calculateEuroValue(assets);
		this.transferableAssets = assets.filter((item) => item.transferrable);
	}

	refreshPrice = async (): Promise<void> => {
		await Promise.allSettled(this.assets.map((item) => item.refreshPrice()));
	};

	private calculateFloatValue = (assets: Asset[]): number => {
		return assets.reduce((sum, currentAsset) => sum + currentAsset.floatAmount(), 0);
	};

	private calculateEuroValue = (assets: Asset[]): number => {
		return assets.reduce((sum, currentAsset) => sum + currentAsset.euroValue(), 0);
	};
}
