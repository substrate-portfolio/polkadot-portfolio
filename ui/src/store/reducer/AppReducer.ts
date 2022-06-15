import { ApiPromise } from "@polkadot/api";
import { IAccount, LoadingScope, StoreState } from "../store";
import { Asset } from "../types/Asset";

export interface IAppReducer {

}

export enum ActionTypes {
  AddNetwork = "AddNetwork",
  RemoveNetwork = "RemoveNetwork",
  AddAccount = "AddAccount",
  RemoveAccount = "RemoveAccount",
  SetLoadingState = "SetLoadingState",
  AddRegistry = "AddRegistry",
  RemoveRegistry = "RemoveRegistry",
  SetAssets = "SetAssets",
}

export interface IAction {
  type: ActionTypes;
  payload: any;
}

const addAccount = (state: StoreState, payload: IAccount): StoreState => ({
  ...state,
  accounts: [...state.accounts, payload]
})

const removeAccount = (state: StoreState, accountId: string): StoreState => ({
  ...state,
  accounts: state.accounts.filter(item => item.id !== accountId)
})

const addNetwork = (state: StoreState, network: string): StoreState => ({
  ...state,
  networks: [...state.networks, network]
})

const removeNetwork = (state: StoreState, network: string): StoreState => ({
  ...state,
  networks: state.networks.filter(item => item !== network)
})

const setLoadingState = (state: StoreState, loadingState: boolean, scope: LoadingScope): StoreState => ({
  ...state,
  loading: {
    ...state.loading,
    [scope]: loadingState
  }
})

const addRegistry = (state: StoreState, network: string, registry: ApiPromise): StoreState => ({
  ...state,
  apiRegistry: state.apiRegistry.set(network, registry)
})

const removeRegistry = (state: StoreState, network: string): StoreState => {
  state.apiRegistry.delete(network)
  return state
}

const setAssets = (state: StoreState, assets: Asset[]): StoreState => ({
  ...state,
  assets,
})


const AppReducer = (state: StoreState, action: IAction): StoreState => {
  switch (action.type) {
    case ActionTypes.AddAccount: 
      return addAccount(state, action.payload)
    case ActionTypes.RemoveAccount: 
      return removeAccount(state, action.payload)
    case ActionTypes.AddNetwork: 
      return addNetwork(state, action.payload)
    case ActionTypes.RemoveNetwork: 
      return removeNetwork(state, action.payload)
    case ActionTypes.SetLoadingState: 
      return setLoadingState(state, action.payload.loadingState, action.payload.scope)
    case ActionTypes.AddRegistry:
      return addRegistry(state, action.payload.network, action.payload.registry)
    case ActionTypes.RemoveRegistry:
      return removeRegistry(state, action.payload)
    case ActionTypes.SetAssets:
      return setAssets(state, action.payload)
    default:
      return state;
  }
}

export default AppReducer;