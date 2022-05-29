import { faClose, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ApiPromise, WsProvider } from "@polkadot/api";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { AppContext } from "../../store";
import { FAddApiRegistry, FAddNetwork, FRemoveApiRegistry, FRemoveNetwork } from "../../store/store";
import Modal from "../Modal";
import ModalBox from "../ModalBox";

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
        <span className="flex-1 inline-block">{networkName.length > 20 ? `${networkName.slice(0,20)}...` : networkName}</span>
        <span className="px-2 rounded-full bg-red-100 hover:bg-red-300 cursor-pointer" onClick={disconnect(network)}>
          <FontAwesomeIcon icon={faClose} size="xs" className="text-red-800" />
        </span>
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
}

const NetworksSetting = (props: AddNetworkProps) => {
  const {addNetwork} = props;
  const [networkInput, setNetworkInput] = useState('')

  const addNetworkToList = useCallback(async () => {
    addNetwork(networkInput);
    setNetworkInput('')
  }, [addNetwork, networkInput])

  const handleInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNetworkInput(event.target.value)
  }, [])

  return (
    <ModalBox title="Add Network">
      <p className="pt-2 px-2 pb-4">Add your network WSS address.</p>
      <input value={networkInput} name="networkInput" className="border rounded-md border-gray-100 bg-white w-full py-2 px-4" placeholder="Network url" onChange={handleInput} />
      <button className="rounded-md mt-7 bg-green-500 hover:bg-green-700 text-center py-2 px-4 mt-2 w-full appearance-none text-white" onClick={addNetworkToList}>Add and Connect</button>
    </ModalBox>
  )
}

const Networks = () => {
  const {state, actions} = useContext(AppContext);
  const { networks, apiRegistry } = state;
  const {removeNetwork, addNetwork, addApiRegistry, removeApiRegistry} = actions;
  const [modalOpen, setModalState] = useState(false)
  
  const handleModalState = React.useCallback((state: boolean) => () => {
    setModalState(state)
  }, [])

  const connect = async (networkUri: string): Promise<ApiPromise> => {
    const provider = new WsProvider(networkUri);
		const api = await ApiPromise.create({ provider });
    return api;
  }

  const setupNetwork = async (network: string) => {
    const api = await connect(network);
    addApiRegistry(network, api)
  }

  React.useEffect(() => {
    networks.forEach((network) => setupNetwork(network))
  }, [networks])

  return (
    <div className="p-4 flex flex-col">
      <div className="flex-none flex justify-between items-center mb-4">
        <span className="font-semibold inline-flex text-xl text-slate-600">Chains</span>
        <button 
          className="inline-flex items-center rounded-md bg-green-500 hover:bg-green-700 text-center text-sm py-2 px-2 appearance-none text-white"
          onClick={handleModalState(true)}
        >
          <span>Add Network</span>
          <FontAwesomeIcon className="ml-2" icon={faPlus} size="xs" color="white" /></button>
      </div>
      <div className="flex-1">
        <NetworksList networks={networks} removeRegistry={removeApiRegistry} registry={apiRegistry} removeNetwork={removeNetwork}/>
      </div>
      <Modal closeFn={handleModalState(false)} state={modalOpen}>
        <NetworksSetting addNetwork={addNetwork} />
      </Modal>
    </div>
  )
}

export default Networks;