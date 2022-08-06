export enum AssetGroups {
	Name,
	Token,
	Account,
	Chain,
	Source,
	Amount,
	Value
}

interface TTableHeads {
	title: string;
	assetGroup: AssetGroups;
}

export const tableHeads: TTableHeads[] = [
	{
		title: 'Name',
		assetGroup: AssetGroups.Name
	},
	{
		title: 'Token',
		assetGroup: AssetGroups.Token
	},
	{
		title: 'Account',
		assetGroup: AssetGroups.Account
	},
	{
		title: 'Chain',
		assetGroup: AssetGroups.Chain
	},
	{
		title: 'Source',
		assetGroup: AssetGroups.Source
	},
	{
		title: 'Amount',
		assetGroup: AssetGroups.Amount
	},
	{
		title: 'Value',
		assetGroup: AssetGroups.Value
	}
];
