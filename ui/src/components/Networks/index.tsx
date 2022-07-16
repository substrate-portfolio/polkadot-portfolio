import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react';
import { AppContext } from '../../store';
import Modal from '../Modal';
import NetworksSetting from './NetworkSettings';
import NetworksList from './NetworksList';

const Networks = () => {
	const { state, actions } = useContext(AppContext);
	const { networks, apiRegistry, visibility } = state;
	const { removeNetwork, addNetwork, changeVisibility, removeApiRegistry } = actions;
	const [modalOpen, setModalState] = useState(false);

	const handleModalState = React.useCallback(
		(state: boolean) => () => {
			setModalState(state);
		},
		[]
	);

	return (
		<div className="p-4 flex flex-col">
			<div className="flex-none flex justify-between items-center mb-4">
				<span className="font-semibold inline-flex text-xl text-slate-600">Chains</span>
				<button
					className="inline-flex items-center rounded-md bg-green-500 hover:bg-green-700 text-center text-sm py-2 px-2 appearance-none text-white"
					onClick={handleModalState(true)}>
					<span>Add Network</span>
					<FontAwesomeIcon className="ml-2" icon={faPlus} size="xs" color="white" />
				</button>
			</div>
			<div className="flex-1">
				<NetworksList
					visibility={visibility}
					changeVisibility={changeVisibility}
					networks={networks}
					removeRegistry={removeApiRegistry}
					registry={apiRegistry}
					removeNetwork={removeNetwork}
				/>
			</div>
			<Modal closeFn={handleModalState(false)} state={modalOpen}>
				<NetworksSetting addNetwork={addNetwork} />
			</Modal>
		</div>
	);
};

export default Networks;
