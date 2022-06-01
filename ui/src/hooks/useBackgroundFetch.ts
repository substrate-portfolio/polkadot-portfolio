import { useCallback, useContext, useEffect, useMemo } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { AppContext } from "../store";
import { Asset } from "../store/types/Asset";
import { IAccount } from "../store/store";
import { scrapeAccountFunds } from "../services/scrapeAccount";
import { usePrevious } from "./usePrevious";

const useSyncNetworks = () => {
  const {state, actions} = useContext(AppContext);
  const { networks, apiRegistry } = state;
  const { addApiRegistry } = actions;
  
  const connect = async (networkUri: string): Promise<ApiPromise> => {
    const provider = new WsProvider(networkUri);
		const api = await ApiPromise.create({ provider });
    return api;
  }

  const setupNetwork = async (network: string) => {
    const api = await connect(network);
    addApiRegistry(network, api)
  }

  useEffect(() => {
    networks.forEach((network) => {
      if(!apiRegistry.has(network)) setupNetwork(network)
    })
  }, [networks])
}

const useSyncAssets = () => {
  const {actions: {setLoading, setAssets}, state} = useContext(AppContext)
  const {networks, accounts, apiRegistry} = state
  
  const prevRegistrySize = usePrevious(apiRegistry.size ?? 0)
  const prevAccountsSize = usePrevious(accounts.length ?? 0)

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
    if(apiRegistry.size !== prevRegistrySize || accounts.length !== prevAccountsSize) {
      refreshAssets(networks, accounts, apiRegistry);
    }
  }, [networks, accounts, apiRegistry, prevRegistrySize, prevAccountsSize]);
}

const useBackgroundFetch = () => {
  useSyncNetworks();
  useSyncAssets();
}

export default useBackgroundFetch;