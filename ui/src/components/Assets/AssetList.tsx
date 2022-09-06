import { useCallback, useEffect, useMemo, useState } from 'react';
import { IAccount } from '../../store/store';
import { Asset, currencyFormat, ApiPromise } from 'polkadot-portfolio-core';
import { AssetGroups, tableHeads } from '../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import GroupedAsset from './GroupedAsset';

interface AssetListProps {
	assets: Asset[];
	accounts: IAccount[];
	apiRegistry: Map<string, ApiPromise>;
	groupBy: AssetGroups | null;
}

interface AssetItemProps {
	asset: Asset;
	accounts: IAccount[];
	apiRegistry: Map<string, ApiPromise>;
}

const styles = {
	tableHead:
		'flex-1 w-full p-2 font-bold cursor-pointer hover:bg-gray-50 inline-flex items-center justify-between',
	emptyBox: 'px-4 py-4 text-lg text-center',
	row: 'flex justify-between w-full hover:bg-gray-50 border-b',
	col: 'flex-1 w-full p-2 text-ellipsis overflow-hidden',
	tableBody: 'flex justify-between w-full border-b-2'
};

export const AssetItem = ({ asset, accounts, apiRegistry }: AssetItemProps) => {
	const accountName = useMemo(() => {
		const account = accounts.find((item) => item.id == asset.origin.account);
		return account?.name ?? '';
	}, [accounts]);

	return (
		<div className={styles.row}>
			<span className={classNames(styles.col, 'whitespace-nowrap')} title={asset.name}>
				{asset.name}
			</span>
			<span className={styles.col}>{asset.ticker}</span>
			<span className={styles.col}>{accountName}</span>
			<span className={styles.col}>{asset.origin.chain}</span>
			<span className={styles.col}>{asset.origin.source}</span>
			<span className={styles.col}>{asset.floatAmount()}</span>
			<span className={styles.col}>{currencyFormat(asset.euroValue())}</span>
		</div>
	);
};

const filterZeroAmount = (item: Asset) => item.floatAmount() > 0;

const sortTable =
	(sortOrder: AssetGroups, asc: boolean) =>
	(a: Asset, b: Asset): number => {
		let orderNumber: number;
		switch (sortOrder) {
			case AssetGroups.Name:
				orderNumber = b.name.localeCompare(a.name);
				break;
			case AssetGroups.Token:
				orderNumber = b.ticker.localeCompare(a.ticker);
				break;
			case AssetGroups.Account:
				orderNumber = b.origin.account.localeCompare(a.origin.account);
				break;
			case AssetGroups.Chain:
				orderNumber = b.origin.chain.localeCompare(a.origin.chain);
				break;
			case AssetGroups.Source:
				orderNumber = b.origin.source.localeCompare(a.origin.source);
				break;
			case AssetGroups.Amount:
				orderNumber = b.floatAmount() - a.floatAmount();
				break;
			case AssetGroups.Value:
				orderNumber = b.euroValue() - a.euroValue();
				break;
		}

		if (asc) return orderNumber * -1;
		return orderNumber;
	};

// TODO: IT WAS BIGGER THAN I INITIALLY THOUGHT, GOING TO IMPLEMENT IT LATER.
const makeGroups = (assetGroups: { [key: string]: Asset[] }, type: AssetGroups): GroupedAsset[] => {
	return Object.entries(assetGroups).reduce((groups, [identifier, groupAssets]) => {
		const groupItem = new GroupedAsset(groupAssets, identifier, type);
		return [...groups, groupItem];
	}, [] as GroupedAsset[]);
};

const groupAssets = (
	assets: Asset[],
	selector: (asset: Asset) => string,
	type: AssetGroups
): GroupedAsset[] => {
	const reduced = assets.reduce((assets, currentAsset) => {
		const identifier = selector(currentAsset);
		return {
			...assets,
			[identifier]: [...(assets[identifier] ?? []), currentAsset]
		};
	}, {} as { [key: string]: Asset[] });

	return makeGroups(reduced, type);
};

const groupAssetsBy = (assets: Asset[], assetGroup: AssetGroups): GroupedAsset[] => {
	let selector = (_: Asset) => '';
	let noop = false;
	switch (assetGroup) {
		case AssetGroups.Token:
			selector = (asset: Asset) => asset.ticker;
			break;
		case AssetGroups.Account:
			selector = (asset: Asset) => asset.origin.account;
			break;
		case AssetGroups.Chain:
			selector = (asset: Asset) => asset.origin.chain;
			break;
		case AssetGroups.Source:
			selector = (asset: Asset) => asset.origin.source;
			break;
		default:
			noop = true;
			break;
	}
	if (noop) return [];
	return groupAssets(assets, selector, assetGroup);
};

export const AssetList = ({ assets, accounts, apiRegistry, groupBy }: AssetListProps) => {
	const [sortOrder, setSortOrder] = useState<AssetGroups>(AssetGroups.Value);
	const [asc, setAsc] = useState<boolean>(false);
	const filteredAssets = useMemo(() => {
		return assets.filter(filterZeroAmount).sort(sortTable(sortOrder, asc));
	}, [assets, sortOrder, asc]);

	const updateSortOrder = useCallback(
		(order: AssetGroups) => () => {
			if (sortOrder === order) setAsc((prev) => !prev);
			else {
				setSortOrder(order);
				setAsc(true);
			}
		},
		[sortOrder]
	);

	useEffect(() => {
		if (groupBy) {
			const groupedAssets = groupAssetsBy(filteredAssets, groupBy);
			console.log(groupedAssets);
		}
	}, [groupBy, filteredAssets, groupAssetsBy]);

	if (filteredAssets.length <= 0)
		return <div className={styles.emptyBox}>No Valued Asset found</div>;

	return (
		<div>
			<div className={classNames('bg-white sticky top-0', styles.tableBody)}>
				{tableHeads.map((th, index) => (
					<span
						key={`${index}__${th.title.toLowerCase()}`}
						className={styles.tableHead}
						onClick={updateSortOrder(th.assetGroup)}>
						{th.title}
						{sortOrder === th.assetGroup ? (
							<FontAwesomeIcon
								icon={asc ? faAngleUp : faAngleDown}
								size="xs"
								className="text-slate-700"
							/>
						) : null}
					</span>
				))}
			</div>
			{filteredAssets.map((asset, index) => (
				<AssetItem
					key={`${asset.name}_${index}`}
					asset={asset}
					accounts={accounts}
					apiRegistry={apiRegistry}
				/>
			))}
		</div>
	);
};
