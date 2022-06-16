import { useContext, useMemo } from 'react';
import { AppContext } from '../../store';
import { currencyFormat } from '../../utils';
import { AssetList } from './AssetList';

const Assets = () => {
  const {state: {accounts, apiRegistry, assets}} = useContext(AppContext)

  const totalAssetValuesInAllChains = useMemo(() => {
    const sum = assets.reduce((sum, asset) => sum + asset.euroValue(), 0)
    return currencyFormat(sum);
  }
  , [assets])

  return(
    <div>
      <div>
        <div className='p-4 border-b border-gray-200'>
          <div className='text-lg'>Total Asset Value in All Chains:</div>
          <div className='text-4xl'><span className='mr-4'>{totalAssetValuesInAllChains}</span></div>
        </div>
        <div>
          <AssetList assets={assets} accounts={accounts} apiRegistry={apiRegistry} />
        </div>
      </div>
    </div>
  )
}

export default Assets;