import classNames from 'classnames';
import { useCallback, useContext, useMemo, useState } from 'react';
import { AppContext } from '../../store';
import { IVisibility } from '../../store/store';
import { Asset, currencyFormat } from 'polkadot-portfolio-core';
import { AssetGroups, tableHeads } from '../../utils/constants';
import { AssetList } from './AssetList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

const GroupableAssets = [
	AssetGroups.Account,
	AssetGroups.Chain,
	AssetGroups.Source,
	AssetGroups.Token
];

const filterVisibility =
	(visibility: IVisibility) =>
	(item: Asset, index: number, array: Asset[]): boolean =>
		!(
			visibility.accounts.includes(item.origin.account) ||
			visibility.networks.includes(item.origin.chain)
		);

const Assets = () => {
	const {
		state: { accounts, apiRegistry, assets, visibility }
	} = useContext(AppContext);
	const filteredAssets = useMemo(
		() => assets.filter(filterVisibility(visibility)),
		[assets, visibility]
	);
	const totalAssetValuesInAllChains = useMemo(() => {
		const sum = filteredAssets.reduce((sum, asset) => sum + asset.euroValue(), 0);
		return currencyFormat(sum);
	}, [filteredAssets]);

	const [groupBy, setGroupBy] = useState<AssetGroups | null>(null);
	const groupAssetsBy = useCallback(
		(gb: AssetGroups | null) => () => {
			if (!(gb && GroupableAssets.includes(gb))) return;
			if (groupBy === gb) setGroupBy(null);
			else setGroupBy(gb);
		},
		[groupBy]
	);

	const groupHeads = useMemo(
		() => tableHeads.filter((item) => GroupableAssets.includes(item.assetGroup)),
		[tableHeads]
	);

	return (
		<div>
			<div>
				<div className="p-4 border-b border-gray-200 flex items-center justify-between">
					<div>
						<div className="text-lg">Total Asset Value in All Chains:</div>
						<div className="text-4xl">
							<span className="mr-4">{totalAssetValuesInAllChains}</span>
						</div>
					</div>
					<div className="inline-flex items-center justify-between">
						<div className="flex items-center">
							<div className="mr-2" title="Group assets by">
								<FontAwesomeIcon icon={faLayerGroup} />
							</div>
							<div>
								{groupHeads.map((item, index) => (
									<span
										className={classNames(
											'inline-block rounded-xl py-1 px-2 border border-transparent cursor-pointer mr-2 hover:text-cyan-800 hover:border-cyan-700',
											{
												'text-cyan-800 border-cyan-800': groupBy === item.assetGroup
											}
										)}
										key={'th_group__' + index}
										onClick={groupAssetsBy(item.assetGroup)}>
										{item.title}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
				<div>
					<AssetList
						groupBy={groupBy}
						assets={filteredAssets}
						accounts={accounts}
						apiRegistry={apiRegistry}
					/>
				</div>
			</div>
		</div>
	);
};

export default Assets;
