import { ApiPromise } from "@polkadot/api"
import { useCallback, useMemo, useState } from "react"
import { IAccount } from "../../store/store"
import { Asset } from "../../store/types/Asset"
import { currencyFormat } from "../../utils"
import { AssetSortOrders, tableHeads } from "../../utils/constants"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons'

interface AssetListProps {
  assets: Asset[]
  accounts: IAccount[]
  apiRegistry: Map<string, ApiPromise>
}

interface AssetItemProps {
  asset: Asset
  accounts: IAccount[]
  apiRegistry: Map<string, ApiPromise>
}

const styles = {
  tableHead: 'flex-1 w-full p-2 font-bold cursor-pointer hover:bg-gray-50 inline-flex items-center justify-between',
  emptyBox: 'px-4 py-4 text-lg text-center',
  row: 'flex justify-between w-full hover:bg-gray-50 border-b',
  col: 'flex-1 w-full p-2',
  tableBody: 'flex justify-between w-full border-b-2'
}

export const AssetItem = ({asset, accounts, apiRegistry}: AssetItemProps) => {
  const accountName = useMemo(() => {
    const account = accounts.find((item) => item.id == asset.origin.account)
    return account?.name ?? ''
  }, [accounts])


  return (
    <div className={styles.row}>
      <span className={styles.col}>{asset.token_name}</span>
      <span className={styles.col}>{accountName}</span>
      <span className={styles.col}>{asset.origin.chain}</span>
      <span className={styles.col}>{asset.origin.source}</span>
      <span className={styles.col}>{asset.format_amount()}</span>
      <span className={styles.col}>{currencyFormat(asset.euroValue())}</span>
    </div>
  )
}

const filterZeroAmount = (item: Asset) => item.numeric_amount() > 0

const sortTable = (sortOrder: AssetSortOrders, asc: boolean) => (a: Asset, b: Asset): number => {
  let orderNumber: number;
  switch (sortOrder) {
    case AssetSortOrders.Token:
      orderNumber = b.token_name.localeCompare(a.token_name)
      break;
    case AssetSortOrders.Account:
      orderNumber = b.origin.account.localeCompare(a.origin.account)
      break;
    case AssetSortOrders.Chain:
      orderNumber = b.origin.chain.localeCompare(a.origin.chain)
      break;
    case AssetSortOrders.Source:
      orderNumber = b.origin.source.localeCompare(a.origin.source)
      break;
    case AssetSortOrders.Amount:
      orderNumber = b.numeric_amount() - a.numeric_amount()
      break;
    case AssetSortOrders.Value:
      orderNumber = b.euroValue() - a.euroValue()
      break;
  }

  if(asc) return orderNumber * -1;
  return orderNumber;
}

export const AssetList = ({assets, accounts, apiRegistry}: AssetListProps) => {
  const [sortOrder, setSortOrder] = useState<AssetSortOrders>(AssetSortOrders.Value)
  const [asc, setAsc] = useState<boolean>(false)
  const filteredAssets = useMemo(() => 
    assets.filter(filterZeroAmount).sort(sortTable(sortOrder, asc))
  , [assets, sortOrder, asc])

  const updateSortOrder = useCallback((order: AssetSortOrders) => () => {
    if(sortOrder === order) setAsc((prev) => !prev)
    else {
      setSortOrder(order)
      setAsc(true)
    }
  },[sortOrder])

  if(filteredAssets.length <= 0) return (
    <div className={styles.emptyBox}>No Valued Asset found</div>
  )

  return (
  <div>
    <div className={styles.tableBody}>
      {tableHeads.map(
        (th, index) => (
          <span
            key={`${index}__${th.title.toLowerCase()}`}
            className={styles.tableHead} 
            onClick={updateSortOrder(th.sortOrder)}
          >
            {th.title}
            {sortOrder === th.sortOrder ? <FontAwesomeIcon icon={asc ? faAngleUp : faAngleDown} size="xs" className="text-slate-700" /> : null}
          </span>
        )
      )}
    </div>
    {filteredAssets.map((asset, index) => <AssetItem key={`${asset.name}_${index}`} asset={asset} accounts={accounts} apiRegistry={apiRegistry} />)}
  </div>
  )
}