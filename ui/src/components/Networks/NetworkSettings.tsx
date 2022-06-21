import classNames from "classnames";
import { useCallback, useState } from "react";
import { FAddNetwork } from "../../store/store";
import { validateWebsocketUrls } from "../../utils/validators";
import ModalBox from "../ModalBox";

export interface AddNetworkProps {
  addNetwork: FAddNetwork,
}

const styles = {
  button: "rounded-md mt-7 bg-green-500 hover:bg-green-700 text-center py-2 px-4 mt-2 w-full appearance-none text-white",
  buttonDisabled: "bg-gray-300 hover:bg-gray-300 cursor-not-allowed",
  input: "border rounded-md border-gray-100 bg-white w-full py-2 px-4",
  inputInvalid: "border-red-500 text-red-500"
}


const NetworksSetting = ({addNetwork}: AddNetworkProps) => {
  const [validNetwork, setValidNetworkState] = useState(false)
  const [networkInput, setNetworkInput] = useState('')

  const addNetworkToList = useCallback(async () => {
    addNetwork(networkInput);
    setNetworkInput('')
  }, [addNetwork, networkInput])

  const handleInput = useCallback(({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
    const isValid = validateWebsocketUrls(value);
    setValidNetworkState(isValid)
    setNetworkInput(value)
  }, [])

  return (
    <ModalBox title="Add Network">
      <p className="pt-2 px-2 pb-4">Add your network WSS address.</p>
      <input value={networkInput} name="networkInput" className={classNames(styles.input, {
        [styles.inputInvalid]: !validNetwork && networkInput.length
      })} placeholder="Network url" onChange={handleInput} />
      {!validNetwork && networkInput.length ? <p className="pt-2 px-2 pb-1 text-red-500">Please enter a valid web socket address.</p> : null}
      <button disabled={!validNetwork} className={classNames(styles.button, {
        [styles.buttonDisabled]: !validNetwork
      })} onClick={addNetworkToList}>Add and Connect</button>
    </ModalBox>
  )
}

export default NetworksSetting;
