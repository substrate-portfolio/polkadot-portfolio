import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faPlus } from '@fortawesome/free-solid-svg-icons'
import React, { useCallback, useContext, useState } from "react";
import { AppContext } from "../../store";
import Modal from "../Modal";
import ModalBox from "../ModalBox";

export const AccountsList = () => {
  const {state, actions} = useContext(AppContext);
  const { accounts } = state;
  const {removeAccount} = actions;

  const handleRemove = useCallback((stash: string) => () => {
    removeAccount(stash);
  }, [removeAccount])

  if(accounts.length) return (
    <div className="py-1">
      {accounts.map((account, index) => 
        <div className="flex items-center py-2 rounded-md hover:bg-slate-50 mb-2 last:mb-0" key={`${index}_${account.name}`}>
          <div className="flex-1">{account.name}</div>
          <div className="px-2 rounded-full bg-red-100 hover:bg-red-300 cursor-pointer" onClick={handleRemove(account.id)}>
            <FontAwesomeIcon icon={faClose} size="xs" className="text-red-800" />
          </div>
        </div>
      )}
    </div>
  )

  return <p>Please add some accounts</p>
}

export const AccountListModify = () => {
  const {actions} = useContext(AppContext);
  const { addAccount } = actions;
  const [name, setNameInput] = useState('')
  const [stash, setIdInput] = useState('')

  const addAccountToList = useCallback(async () => {
    addAccount({
      name,
      id: stash,
    });
    setNameInput('')
    setIdInput('')
  }, [addAccount, name, stash])

  const handleStash = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIdInput(event.target.value)
  }, [])

  const handleName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value)
  }, [])

  return (
    <ModalBox title="Add New Account">
      <div className="flex flex-col flex-1">  
        <input value={name} className="border rounded-md border-gray-100 py-2 px-4 mb-2" placeholder="Account Name" onChange={handleName} />
        <input value={stash} className="border rounded-md border-gray-100 py-2 px-4" placeholder="Account Id" onChange={handleStash} />
      </div>
      <button className="rounded-md mt-7 bg-green-500 hover:bg-green-700 text-center py-2 px-4 w-full appearance-none text-white" onClick={addAccountToList}>Add Account</button>
    </ModalBox>
  )
}

export const Accounts = () => {
  const [modalOpen, setModalState] = useState(false)
  
  const handleModalState = React.useCallback((state: boolean) => () => {
    setModalState(state)
  }, [])

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
        <AccountListModify />
      </Modal>
    </div>
  )
}