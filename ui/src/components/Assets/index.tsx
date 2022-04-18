import { ApiPromise } from '@polkadot/api';
import React, { useCallback, useContext, useEffect } from 'react';
import { scrapeAccountFunds } from '../../services/scrapeAccount';
import { AppContext } from '../../store';
import { IAccount } from '../../store/store'
import { PerAccount, PerChain, PerPallet } from '../../store/types';
import { priceOf } from '../../utils';

interface PalletListProps {
  pallets: PerPallet[]
}

const PalletList = ({pallets}: PalletListProps) => {
  if(pallets.length <= 0) return <p>No pallet found in this account</p>
  return <div>{pallets.map((pallet: PerPallet) => (
    <div key={pallet.name}>
      <h5>Pallet: {pallet.name} - Assets:</h5>
      {pallet.assets.map((asset) => 
        <div>
          <p>{`${asset.amount.toNumber()}${asset.token_name} - Euro: ${asset.euroValue()}`}</p>
        </div>
      )}
    </div>
  ))}
  </div>
}

interface AccountListProps {
  accounts: PerAccount[]
}

const AccountList = ({accounts}: AccountListProps) => {
  if(accounts.length <= 0) return <p>No account found in this</p>
  return (
    <div>
      {accounts.map((account: PerAccount) => (
        <div key={account.id}>
          <h3>{account.name} - Pallets:</h3>
          <PalletList pallets={account.pallets}/>
        </div>
      ))}
    </div>
  )
}

const Assets = () => {
  const {actions, state} = useContext(AppContext)
  const {addChain, setLoading} = actions
  const {networks, accounts, chainData, apiRegistry} = state;
  
  const getChainData = useCallback(async (networks: string[], accounts: IAccount[], apiRegistry: Map<string, ApiPromise>) => {
    setLoading(true);
    for (const networkWs of networks) {
      const api = apiRegistry.get(networkWs)!;
      const chain = (await api.rpc.system.chain()).toLowerCase();
  
      const nativeToken = api.registry.chainTokens[0];
      const price = await priceOf(nativeToken);
  
      const chainAccounts: PerAccount[] = [];
      (await Promise.all(accounts.map(({id: account, name}) => {
        return scrapeAccountFunds(account, name, nativeToken, price, api)
      }))).forEach((perAccount) => chainAccounts.push(perAccount))
  
      const chainData = new PerChain({ accounts: chainAccounts, name: chain });
      console.log(chainData);
      addChain(networkWs, chainData)
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('Chain Data:', chainData)
  }, [chainData])
  
  useEffect(() => {
    if(networks.length < 1 && accounts.length < 1) return;
    getChainData(networks, accounts, apiRegistry);
  }, [networks, accounts, apiRegistry]);

  return(
    <div>
      <h1>chains:</h1>
      <div>
        {
          Object.entries(Object.fromEntries(chainData)).map(
            (([key, perChain]: [string, PerChain]) => {
              return (
                <div key={key}>
                  <h2><b>{perChain.name}:</b></h2>
                  <AccountList accounts={perChain.accounts} />
                  <hr/>
                </div>
              )
            })
          )
        }
      </div>
    </div>
  )
}

export default Assets;