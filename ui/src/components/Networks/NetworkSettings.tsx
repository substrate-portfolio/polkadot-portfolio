import classNames from "classnames";
import { useCallback, useState } from "react";
import { FAddNetwork } from "../../store/store";
import { SharedStyles as styles} from "../../utils/styles";
import { validateWebsocketUrls } from "../../utils/validators";
import ModalBox from "../ModalBox";

export interface AddNetworkProps {
  addNetwork: FAddNetwork,
}


const NetworksSetting = ({addNetwork}: AddNetworkProps) => {
  const [validNetwork, setValidNetworkState] = useState(false)
  const [networkInput, setNetworkInput] = useState('')

  const addNetworkToList = useCallback(async () => {
    if(!validNetwork) return;
    addNetwork(networkInput);
    setNetworkInput('')
  }, [addNetwork, networkInput, validNetwork])

  const handleInput = useCallback(({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
    const isValid = validateWebsocketUrls(value);
    setValidNetworkState(isValid)
    setNetworkInput(value)
  }, [])

  return (
    <ModalBox title="Add Network">
      <p className="pt-2 px-2 pb-4">Add your network WSS address.</p>
      <input value={networkInput} name="networkInput" className={classNames(styles.input.default, {
        [styles.input.invalid]: !validNetwork && networkInput.length
      })} placeholder="Network url" onChange={handleInput} />
      {!validNetwork && networkInput.length ? <p className="pt-2 px-2 pb-1 text-red-500">Please enter a valid web socket address.</p> : null}
      <button disabled={!validNetwork} className={classNames(styles.button.default, {
        [styles.button.disabled]: !validNetwork
      })} onClick={addNetworkToList}>Add and Connect</button>
    </ModalBox>
  )
}

export default NetworksSetting;
