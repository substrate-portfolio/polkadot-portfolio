export enum AssetSortOrders {
  Token,
  Account,
  Chain,
  Source,
  Amount,
  Value
}

interface TTableHeads {
  title: string,
  sortOrder: AssetSortOrders
}

export const tableHeads: TTableHeads[] = [{
  title: 'Token Name',
  sortOrder: AssetSortOrders.Token
},{
  title: 'Account Name',
  sortOrder: AssetSortOrders.Account
}, {
  title: 'Chain',
  sortOrder: AssetSortOrders.Chain
}, {
  title: 'Source',
  sortOrder: AssetSortOrders.Source
}, {
  title: 'Amount',
  sortOrder: AssetSortOrders.Amount
}, {
  title: 'Value',
  sortOrder: AssetSortOrders.Value
}]
