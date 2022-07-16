import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import Modal from '../Modal';
import AccountsList from './AccountsList';
import AccountListSettings from './AccountListSettings';

export const Accounts = () => {
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
        <span className="font-semibold inline-flex text-xl text-slate-600">Accounts</span>
        <button
          className="inline-flex items-center rounded-md bg-green-500 hover:bg-green-700 text-center text-sm py-2 px-2 appearance-none text-white"
          onClick={handleModalState(true)}
        >
          <span className="">Add Account</span>
          <FontAwesomeIcon className="ml-2" icon={faPlus} size="xs" color="white" />
        </button>
      </div>
      <div className="flex-1">
        <AccountsList />
      </div>
      <Modal closeFn={handleModalState(false)} state={modalOpen}>
        <AccountListSettings />
      </Modal>
    </div>
  );
};
