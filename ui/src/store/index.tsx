import React, { useReducer } from 'react';
import AppReducer, { ActionTypes } from './reducer/AppReducer';
import { FAddAccount, FAddApiRegistry, FAddChain, FAddNetwork, FRemoveApiRegistry, FRemoveChain, FRemoveNetwork, FSetLoading, IActionList, IAppContext, StoreState } from './store';

export const initialState = {
  accounts: [],
  networks: [],
  chainData: new Map(),
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

  const addChain: FAddChain = (network, chain) => {
    dispatch({
      type: ActionTypes.AddChain,
      payload: {
        network,
        chain
      },
    })
  }

  const removeChain: FRemoveChain = (network) => {
    dispatch({
      type: ActionTypes.RemoveChain,
      payload: network,
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
    addChain,
    removeChain,
  } as IActionList

  const context = {
    state,
    actions,
  }

  return (
    <AppContext.Provider value={context}>
      {children}
    </AppContext.Provider>
  )
}