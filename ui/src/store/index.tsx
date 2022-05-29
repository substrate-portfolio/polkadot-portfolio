import React, { useReducer } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';
import AppReducer, { ActionTypes } from './reducer/AppReducer';
import { FAddAccount, FAddApiRegistry, FAddNetwork, FRemoveApiRegistry, FRemoveNetwork, FSetAssets, FSetLoading, IAccount, IActionList, IAppContext, StoreState } from './store';

const INITIAL_NETWORKS = ["wss://kusama-rpc.polkadot.io",
"wss://rpc.polkadot.io",
"wss://statemine-rpc.polkadot.io",
"wss://karura-rpc-0.aca-api.network",
"wss://acala-polkadot.api.onfinality.io/public-ws",
"wss://khala-api.phala.network/ws",
"wss://rpc.astar.network",
"wss://rpc.parallel.fi",
"wss://wss.api.moonbeam.network",
"wss://wss.moonriver.moonbeam.network"]

const NETWORK_KEY = "networks"
const ACCOUNT_KEY = "accounts"

export const initialState = {
  accounts: getLocalStorage(ACCOUNT_KEY) ?? [],
  networks: getLocalStorage(NETWORK_KEY) ?? INITIAL_NETWORKS,
  assets: [],
  apiRegistry: new Map(),
  loading: false,
} as StoreState

export const defaultContext = {
  state: initialState,
  actions: {} as IActionList
} as IAppContext

export const AppContext = React.createContext(defaultContext);

export const AppContextProvider = ({ children } : {children: any}) => {
  const [state, dispatch]: [StoreState, any] = useReducer(AppReducer, initialState)

  const addNetwork: FAddNetwork = (network) => {
    dispatch({
      type: ActionTypes.AddNetwork,
      payload: network,
    })
  }

  const removeNetwork: FRemoveNetwork = (network) => {
    dispatch({
      type: ActionTypes.RemoveNetwork,
      payload: network,
    })
  }

  const addAccount: FAddAccount = (account) => {
    dispatch({
      type: ActionTypes.AddAccount,
      payload: account,
    })
  }

  const removeAccount: FRemoveNetwork = (accountId) => {
    dispatch({
      type: ActionTypes.RemoveAccount,
      payload: accountId,
    })
  }

  const setLoading: FSetLoading = (state) => {
    dispatch({
      type: ActionTypes.SetLoadingState,
      payload: state,
    })
  }

  const addApiRegistry: FAddApiRegistry = (network, registry) => {
    dispatch({
      type: ActionTypes.AddRegistry,
      payload: {
        network,
        registry
      },
    })
  }

  const removeApiRegistry: FRemoveApiRegistry = (network) => {
    dispatch({
      type: ActionTypes.RemoveRegistry,
      payload: network,
    })
  }

  const setAssets: FSetAssets = (assets) => {
    dispatch({
      type: ActionTypes.SetAssets,
      payload: assets,
    })
  }

  const actions = {
    addNetwork,
    removeNetwork,
    addAccount,
    removeAccount,
    setLoading,
    addApiRegistry,
    removeApiRegistry,
    setAssets
  } as IActionList

  const context = {
    state,
    actions,
  }
  
  React.useEffect(() => {
    const {accounts, networks} = state
    setLocalStorage(ACCOUNT_KEY, accounts)
    setLocalStorage(NETWORK_KEY, networks)
  }, [state])

  return (
    <AppContext.Provider value={context}>
      {children}
    </AppContext.Provider>
  )
}