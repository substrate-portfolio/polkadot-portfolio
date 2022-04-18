import { ApiPromise, WsProvider } from "@polkadot/api";
import React, { useCallback, useContext, useState } from "react";
import { AppContext } from "../../store";
import { FAddApiRegistry, FAddNetwork, FRemoveApiRegistry, FRemoveChain, FRemoveNetwork } from "../../store/store";

interface NetworksListProps {
  networks: string[]
  registry: Map<string, ApiPromise>
  removeNetwork: FRemoveNetwork,
  removeRegistry: FRemoveApiRegistry,
  removeChain: FRemoveChain,
}

const NetworksList = (props: NetworksListProps) => {
  const {networks, registry, removeNetwork, removeRegistry, removeChain} = props;

  console.log("registry:", registry)

  const handleRemove = useCallback((network: string) => () => {
    removeNetwork(network)
    removeRegistry(network)
    removeChain(network)
  }, [removeNetwork])

  if(networks.length) return (
    <ul className="networksList">
      {networks.map((network, index) => 
        <li onClick={handleRemove(network)} key={`${index}_${network}`}>
          {network}
          {registry.has(network) ? '- Connected' : null}
        </li>
      )}
    </ul>
  )

  return <p>Please add some networks</p>
}

interface AddNetworkProps {
  addNetwork: FAddNetwork,
  addRegistry: FAddApiRegistry,
}

const NetworksSetting = (props: AddNetworkProps) => {
  const {addNetwork, addRegistry} = props;
  const [networkInput, setNetworkInput] = useState("")

  const connect = async (networkUri: string): Promise<ApiPromise> => {
    const provider = new WsProvider(networkUri);
		const api = await ApiPromise.create({ provider });
    console.log(api)
    return api;
  }

  const addNetworkToList = useCallback(async () => {
    addNetwork(networkInput);
    const api = await connect(networkInput);
    addRegistry(networkInput, api)
    setNetworkInput('')
  }, [addNetwork, networkInput])

  const handleInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNetworkInput(event.target.value)
  }, [])

  return (
    <div>
      <input placeholder="Network url" onInput={handleInput} />
      <button onClick={addNetworkToList}>Add and Connect to Network</button>
    </div>
  )
}

const Networks = () => {
  const {state, actions} = useContext(AppContext);
  const { networks, apiRegistry } = state;
  const {removeNetwork, addNetwork, addApiRegistry, removeApiRegistry, removeChain} = actions;

  return (
    <div>
      <h1>Networks:</h1>
      <NetworksList removeChain={removeChain} networks={networks} removeRegistry={removeApiRegistry} registry={apiRegistry} removeNetwork={removeNetwork}/>
      <NetworksSetting addNetwork={addNetwork} addRegistry={addApiRegistry} />
    </div>
  )
}

export default Networks;