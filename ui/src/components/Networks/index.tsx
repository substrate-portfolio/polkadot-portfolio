import { ApiPromise, WsProvider } from "@polkadot/api";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { AppContext } from "../../store";
import { FAddApiRegistry, FAddNetwork, FRemoveApiRegistry, FRemoveNetwork } from "../../store/store";

interface NetworkItemProps {
  key: string,
  network: string,
  registry: ApiPromise | undefined,
  disconnect: (network: string) => () => void,
}

const NetworkItem = ({key, network, registry, disconnect}: NetworkItemProps) => {
  const networkName = useMemo(() => registry?.runtimeChain ?? network, [network, registry])
  const isConnected = useMemo(() => registry?.isConnected, [registry])
  return (
    <div key={key}>
      <div className="flex items-center py-1">
        <span className={`w-3 h-3 rounded-full mr-4 inline-block ${isConnected ? 'bg-green-600' : 'bg-orange-500'}`}></span>
        <span className="flex-1 inline-block">{networkName}</span>
        <span className="px-2 rounded-full bg-red-100 hover:bg-red-300 cursor-pointer" onClick={disconnect(network)}>x</span>
      </div>
    </div>
  )
}

interface NetworksListProps {
  networks: string[]
  registry: Map<string, ApiPromise>
  removeNetwork: FRemoveNetwork,
  removeRegistry: FRemoveApiRegistry,
}

const NetworksList = (props: NetworksListProps) => {
  const {networks, registry, removeNetwork, removeRegistry} = props;

  console.log("registry:", registry)

  const handleDisconnect = useCallback((network: string) => () => {
    removeNetwork(network)
    removeRegistry(network)
  }, [removeNetwork])

  if(networks.length) return (
    <div>
      {networks.map((network, index) => 
        <NetworkItem network={network} registry={registry.get(network)} disconnect={handleDisconnect} key={`${index}_${network}`} />
      )}
    </div>
  )

  return <p>Please add some networks</p>
}

interface AddNetworkProps {
  addNetwork: FAddNetwork,
  addRegistry: FAddApiRegistry,
  networks: string[],
}

const NetworksSetting = (props: AddNetworkProps) => {
  const {addNetwork, addRegistry, networks} = props;
  const [networkInput, setNetworkInput] = useState('')

  const connect = async (networkUri: string): Promise<ApiPromise> => {
    const provider = new WsProvider(networkUri);
		const api = await ApiPromise.create({ provider });
    return api;
  }

  const addNetworkToList = useCallback(async () => {
    addNetwork(networkInput);
    setNetworkInput('')
  }, [addNetwork, networkInput])

  const handleInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNetworkInput(event.target.value)
  }, [])

  const setupNetwork = async (network: string) => {
    const api = await connect(network);
    addRegistry(network, api)
  }

  React.useEffect(() => {
    networks.forEach((network) => setupNetwork(network))
  }, [networks])

  return (
    <div className="border-t pt-4 pb-2 border-gray-400">
      <input value={networkInput} name="networkInput" className="border border-gray-100 bg-white w-full py-2 px-4" placeholder="Network url" onChange={handleInput} />
      <button className="rounded-md bg-green-500 hover:bg-green-700 text-center py-2 px-4 mt-2 w-full appearance-none text-white" onClick={addNetworkToList}>Connect and Add</button>
    </div>
  )
}

const Networks = () => {
  const {state, actions} = useContext(AppContext);
  const { networks, apiRegistry } = state;
  const {removeNetwork, addNetwork, addApiRegistry, removeApiRegistry} = actions;

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex-none">
        <div className="font-semibold text-xl mb-4 text-slate-600">Chains</div>
      </div>
      <div className="flex-1">
        <NetworksList networks={networks} removeRegistry={removeApiRegistry} registry={apiRegistry} removeNetwork={removeNetwork}/>
      </div>
      <div>
        <NetworksSetting networks={networks} addNetwork={addNetwork} addRegistry={addApiRegistry} />
      </div>
    </div>
  )
}

export default Networks;