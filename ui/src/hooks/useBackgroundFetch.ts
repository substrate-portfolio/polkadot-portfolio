import { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from '../store';
import { IAccount, LoadingScope } from '../store/store.d';
import { Asset, scrape, makeApi, ApiPromise } from 'polkadot-portfolio-core';
import { usePrevious } from './usePrevious';

const useSyncNetworks = (useTrigger: TriggerRefresh) => {
	const [_, setRefresh] = useTrigger;
	const { state, actions } = useContext(AppContext);
	const { networks, apiRegistry } = state;
	const { addApiRegistry, setLoading } = actions;

	const connect = async (networkUri: string): Promise<ApiPromise> => {
		const { api } = await makeApi(networkUri);
		return api;
	};

	const setupNetwork = useCallback(async (network: string) => {
		setLoading(true, LoadingScope.networks);
		const api = await connect(network);
		addApiRegistry(network, api);
		setRefresh((prevState) => prevState + 1);
		setLoading(false, LoadingScope.networks);
	}, []);

	useEffect(() => {
		for (const network of networks) {
			if (!apiRegistry.has(network)) setupNetwork(network);
		}
	}, [networks, setupNetwork, apiRegistry]);
};

const useSyncAssets = (useTrigger: TriggerRefresh) => {
	const [refresh, _] = useTrigger;
	const {
		actions: { setLoading, setAssets },
		state
	} = useContext(AppContext);
	const { networks, accounts, apiRegistry } = state;

	const prevRegistrySize = usePrevious(apiRegistry.size ?? 0);
	const prevAccountsSize = usePrevious(accounts.length ?? 0);

	const fetchAllAssets = useCallback(
		async (
			networks: string[],
			accounts: IAccount[],
			apiRegistry: Map<string, ApiPromise>
		): Promise<Asset[]> => {
			setLoading(true, LoadingScope.assets);
			let assets: Asset[] = [];
			for (const networkWs of networks) {
				const api = apiRegistry.get(networkWs)!;
				(await Promise.allSettled(accounts.map(({ id: account }) => scrape(account, api)))).forEach(
					(result) => {
						if (result.status === 'fulfilled') {
							assets = assets.concat(result.value);
						}
					}
				);
			}
			setLoading(false, LoadingScope.assets);
			return assets;
		},
		[]
	);

	const refreshAssets = useCallback(
		async (networks: string[], accounts: IAccount[], apiRegistry: Map<string, ApiPromise>) => {
			const assets = await fetchAllAssets(networks, accounts, apiRegistry);
			setAssets(assets);
		},
		[fetchAllAssets, setAssets]
	);

	useEffect(() => {
		if (apiRegistry.size !== prevRegistrySize || accounts.length !== prevAccountsSize) {
			refreshAssets(networks, accounts, apiRegistry);
		}
	}, [networks, accounts, apiRegistry, prevRegistrySize, prevAccountsSize, refresh]);
};

type TriggerRefresh = [number, React.Dispatch<React.SetStateAction<number>>];

const useBackgroundFetch = () => {
	const triggerRefresh: TriggerRefresh = useState(0);
	useSyncNetworks(triggerRefresh);
	useSyncAssets(triggerRefresh);
};

export default useBackgroundFetch;
