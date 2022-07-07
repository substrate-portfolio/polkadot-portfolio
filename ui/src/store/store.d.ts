import { ApiPromise } from "@polkadot/api";
import { Asset } from "./types/Asset";
import {IApiRegistry} from "polkadot-portfolio-core"

export interface StoreState {
  accounts: IAccount[],
  networks: string[],
  apiRegistry: IApiRegistry,
  assets: Asset[],
  visibility: IVisibility,
  loading: LoadingStates,
}

export interface IVisibility {
  networks: string[],
  accounts: string[],
}

export interface IAppContext {
  state: StoreState,
  actions: IActionList,
}

export interface IAccount {
  name: string;
  id: string;
}

export interface LoadingStates {
  [key: LoadingScope]: boolean
}

export enum LoadingScope {
  networks = 'networks',
  assets = 'assets'
}


export interface IActionList {
  addNetwork: FAddNetwork,
  removeNetwork: FRemoveNetwork,
  addAccount: FAddAccount,
  removeAccount: FRemoveAccount,
  setLoading: FSetLoading,
  addApiRegistry: FAddApiRegistry,
  removeApiRegistry: FRemoveApiRegistry,
  setAssets: FSetAssets,
  changeVisibility: FChangeVisibility,
}

export type FAddNetwork = (network: string) => void
export type FRemoveNetwork = (network: string) => void
export type FAddAccount = (account: IAccount) => void
export type FRemoveAccount = (accountId: string) => void
export type FSetLoading = (state: boolean, scope: LoadingScope) => void
export type FAddApiRegistry = (network: string, registry: ApiPromise) => void
export type FRemoveApiRegistry = (network: string) => void
export type FSetAssets = (assets: Asset[]) => void
export type FChangeVisibility = (account?: string | null, network?: string | null) => void
