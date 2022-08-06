import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FAddNetwork } from '../../store/store';
import { SharedStyles as styles } from '../../utils/styles';
import { validateWebsocketUrls } from '../../utils/validators';
import ModalBox from '../ModalBox';
import ManualNetwork from './ManualNetworkInput';
import NetworkLookup from './NetworkLookup';

export interface AddNetworkProps {
	addNetwork: FAddNetwork;
}

const NetworksSetting = ({ addNetwork }: AddNetworkProps) => {
	const [validNetwork, setValidNetworkState] = useState(false);
	const [networkInput, setNetworkInput] = useState('');
	const [manualMode, setManualMode] = useState(false);

	const addNetworkToList = useCallback(async () => {
		if (!validNetwork) return;
		addNetwork(networkInput);
		setNetworkInput('');
	}, [addNetwork, networkInput, validNetwork]);

	const toggleManualNetwork = useCallback(() => {
		setManualMode((prev) => !prev);
	}, []);

	useEffect(() => {
		const isValid = validateWebsocketUrls(networkInput);
		setValidNetworkState(isValid);
	}, [networkInput]);

	const toggleButtonText = useMemo(
		() => (!manualMode ? 'Enter URL Manually' : 'Search Networks'),
		[manualMode]
	);

	return (
		<ModalBox title="Add Network">
			{manualMode ? (
				<ManualNetwork
					networkInput={networkInput}
					setNetworkInput={setNetworkInput}
					validNetwork={validNetwork}
					setValidNetworkState={setValidNetworkState}
				/>
			) : (
				<NetworkLookup setNetworkInput={setNetworkInput} />
			)}
			<div className="flex mt-4 border-t border-t-gray-100">
				<div
					className="text-center text-gray-600 hover:text-gray-800 cursor-pointer py-2 px-4 w-full mt-2 mr-2"
					onClick={toggleManualNetwork}>
					{toggleButtonText}
				</div>
				<button
					disabled={!validNetwork}
					className={classNames(styles.button.default, {
						[styles.button.disabled]: !validNetwork
					})}
					onClick={addNetworkToList}>
					Add and Connect
				</button>
			</div>
		</ModalBox>
	);
};

export default NetworksSetting;
