import { ApiPromise } from "@polkadot/api";
import { PerChain } from "./types";

export interface StoreState {
  accounts: IAccount[],
  networks: string[],
  apiRegistry: Map<string, ApiRegistry>,
  chainData: Map<string, PerChain>,
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
  addChain: FAddChain,
  removeChain: FRemoveChain,
}

export type FAddNetwork = (network: string) => void
export type FRemoveNetwork = (network: string) => void
export type FAddAccount = (account: IAccount) => void
export type FRemoveAccount = (accountId: string) => void
export type FSetLoading = (state: boolean) => void
export type FAddApiRegistry = (network: string, registry: ApiPromise) => void
export type FRemoveApiRegistry = (network: string) => void
export type FAddChain = (network: string, chainData: PerChain) => void
export type FRemoveChain = (network: string) => void
