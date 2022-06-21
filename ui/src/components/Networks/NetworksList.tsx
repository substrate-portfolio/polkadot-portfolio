import { faClose, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ApiPromise } from "@polkadot/api";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { FChangeVisibility, FRemoveApiRegistry, FRemoveNetwork, IVisibility } from "../../store/store";

interface NetworkItemProps {
  key: string,
  network: string,
  registry: ApiPromise | undefined,
  visibility: IVisibility,
  disconnect: (network: string) => () => void,
  handleVisibility: (network: string) => () => void,
}

const NetworkItem = ({key, network, visibility, registry, disconnect, handleVisibility}: NetworkItemProps) => {
  const networkName = useMemo(() => registry?.runtimeChain ?? network, [network, registry])
  const {networks: hiddenNetworks} = visibility;
  const isConnected = useMemo(() => registry?.isConnected, [registry])
  return (
    <div key={key}>
      <div className="flex items-center py-1">
        <span className={`w-3 h-3 rounded-full mr-4 inline-block ${isConnected ? 'bg-green-600' : 'bg-orange-500'}`}></span>
        <span className="flex-1 inline-block">{networkName.length > 20 ? `${networkName.slice(0,20)}...` : networkName}</span>
        <div className="inline-flex items-center">
          <div className="px-2 mr-2 rounded-ful cursor-pointer" onClick={handleVisibility(network)}>
            <FontAwesomeIcon icon={hiddenNetworks.includes(network) ? faEyeSlash : faEye} size="xs" className={classNames("text-gray-600 hover:text-cyan-500", {
              "text-cyan-500": hiddenNetworks.includes(network)
            })} />
          </div>
          <div className="px-2 rounded-full bg-red-100 hover:bg-red-300 cursor-pointer" onClick={disconnect(network)}>
            <FontAwesomeIcon icon={faClose} size="xs" className="text-red-800" />
          </div>
        </div>
      </div>
    </div>
  )
}

export interface NetworksListProps {
  networks: string[]
  registry: Map<string, ApiPromise>,
  visibility: IVisibility,
  removeNetwork: FRemoveNetwork,
  removeRegistry: FRemoveApiRegistry,
  changeVisibility: FChangeVisibility,
}

const NetworksList = (props: NetworksListProps) => {
  const {networks, registry, visibility, removeNetwork, removeRegistry, changeVisibility} = props;

  const handleDisconnect = useCallback((network: string) => () => {
    removeNetwork(network)
    removeRegistry(network)
  }, [removeNetwork])

  const handleVisibility = useCallback((network: string) => () => {
    changeVisibility(null, network)
  }, [changeVisibility])

  if(networks.length) return (
    <div>
      {networks.map((network, index) => 
        <NetworkItem network={network} visibility={visibility} registry={registry.get(network)} disconnect={handleDisconnect} handleVisibility={handleVisibility} key={`${index}_${network}`} />
      )}
    </div>
  )

  return <p>Please add some networks</p>
}

export default NetworksList;
