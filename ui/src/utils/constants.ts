export enum AssetGroups {
  Token,
  Account,
  Chain,
  Source,
  Amount,
  Value
}

interface TTableHeads {
  title: string,
  assetGroup: AssetGroups
}

export const tableHeads: TTableHeads[] = [{
  title: 'Token Name',
  assetGroup: AssetGroups.Token
},{
  title: 'Account Name',
  assetGroup: AssetGroups.Account
}, {
  title: 'Chain',
  assetGroup: AssetGroups.Chain
}, {
  title: 'Source',
  assetGroup: AssetGroups.Source
}, {
  title: 'Amount',
  assetGroup: AssetGroups.Amount
}, {
  title: 'Value',
  assetGroup: AssetGroups.Value
}]
