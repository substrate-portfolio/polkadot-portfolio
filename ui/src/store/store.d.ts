import { ApiPromise } from "@polkadot/api";
import { Asset } from "./types/Asset";

export interface StoreState {
  accounts: IAccount[],
  networks: string[],
  apiRegistry: Map<string, ApiRegistry>,
  assets: Asset[],
  loading: boolean,
}

export interface IAppContext {
  state: StoreState,
  actions: IActionList
}

export interface IAccount {
  name: string;
  id: string;
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
}

export type FAddNetwork = (network: string) => void
export type FRemoveNetwork = (network: string) => void
export type FAddAccount = (account: IAccount) => void
export type FRemoveAccount = (accountId: string) => void
export type FSetLoading = (state: boolean) => void
export type FAddApiRegistry = (network: string, registry: ApiPromise) => void
export type FRemoveApiRegistry = (network: string) => void
export type FSetAssets = (assets: Asset[]) => void
