import { ApiPromise } from '@polkadot/api';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { scrapeAccountFunds } from '../../services/scrapeAccount';
import { AppContext } from '../../store';
import { IAccount } from '../../store/store'
import { Asset } from '../../store/types/Asset';

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

const AssetItem = ({asset, accounts, apiRegistry}: AssetItemProps) => {
  const accountName = useMemo(() => {
    const account = accounts.find((item) => item.id == asset.origin.account)
    return account?.name ?? ''
  }, [accounts])


  return (
    <div className='flex justify-between w-full mb-2 hover:bg-gray-50 border-b'>
      <span className='flex-1 w-full p-2'>{asset.token_name}</span>
      <span className='flex-1 w-full p-2'>{accountName}</span>
      <span className='flex-1 w-full p-2'>{asset.origin.chain}</span>
      <span className='flex-1 w-full p-2'>{asset.origin.source}</span>
      <span className='flex-1 w-full p-2'>{asset.format_amount()}</span>
      <span className='flex-1 w-full p-2'>{asset.euroValue()}</span>
    </div>
  )
}

const AssetList = ({assets, accounts, apiRegistry}: AssetListProps) => {
  const filteredAssets = useMemo(() => 
    assets.filter((item) => parseInt(item.format_amount()) > 0)
  , [assets])

  if(assets.length <= 0) return (
    <div>No Asset found</div>
  )

  return (
  <div>
    <div className='flex justify-between w-full border-b-2'>
      <span className='flex-1 w-full p-2 font-bold'>Token Name</span>
      <span className='flex-1 w-full p-2 font-bold'>Account Name</span>
      <span className='flex-1 w-full p-2 font-bold'>Chain</span>
      <span className='flex-1 w-full p-2 font-bold'>Source</span>
      <span className='flex-1 w-full p-2 font-bold'>Amount</span>
      <span className='flex-1 w-full p-2 font-bold'>Value</span>
    </div>
    {filteredAssets.map((asset, index) => <AssetItem key={`${asset.name}_${index}`} asset={asset} accounts={accounts} apiRegistry={apiRegistry} />)}
  </div>
  )
}

const Assets = () => {
  const {actions, state} = useContext(AppContext)
  const {setLoading, setAssets} = actions
  const {networks, accounts, apiRegistry, assets} = state;

  const totalAssetValuesInAllChains = useMemo(() => 
    assets.reduce((sum, asset) => sum + asset.euroValue(), 0)
  , [assets])

  const fetchAllAssets = useCallback(async (networks: string[], accounts: IAccount[], apiRegistry: Map<string, ApiPromise>): Promise<Asset[]> => {
    setLoading(true);
    let assets: Asset[] = [];
    for (const networkWs of networks) {
      const api = apiRegistry.get(networkWs)!;

      (await Promise.allSettled(accounts.map(({id: account}) => scrapeAccountFunds(account, api)
      ))).forEach((result) => {
        if(result.status === "fulfilled") {
          assets = assets.concat(result.value)
        }
      })
    }
    setLoading(false);
    return assets;
  }, []);

  const refreshAssets = useCallback(async (networks: string[], accounts: IAccount[], apiRegistry: Map<string, ApiPromise>) => {
    const assets = await fetchAllAssets(networks, accounts, apiRegistry);
    setAssets(assets)
  }, [fetchAllAssets, setAssets])
  
  useEffect(() => {
    if(networks.length < 1 && accounts.length < 1) return;
    refreshAssets(networks, accounts, apiRegistry);
  }, [networks, accounts, apiRegistry]);

  return(
    <div>
      <div>
        <div className='p-4 border-b border-gray-200'>
          <div className='text-lg'>Total Asset Value in All Chains:</div>
          <div className='text-4xl'><span className='mr-4'>{totalAssetValuesInAllChains}</span><span>Euro</span></div>
        </div>
        <div>
          <AssetList assets={assets} accounts={accounts} apiRegistry={apiRegistry} />
        </div>
      </div>
    </div>
  )
}

export default Assets;