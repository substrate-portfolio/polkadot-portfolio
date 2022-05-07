import React, { useCallback, useContext, useState } from "react";
import { AppContext } from "../../store";

export const AccountsList = () => {
  const {state, actions} = useContext(AppContext);
  const { accounts } = state;
  const {removeAccount} = actions;

  const handleRemove = useCallback((stash: string) => () => {
    removeAccount(stash);
  }, [removeAccount])

  if(accounts.length) return (
    <div className="py-4 pr-4">
      <div className="font-semibold text-xl mb-4 text-slate-600">Accounts</div>
      <div className="">
        {accounts.map((account, index) => 
          <div className="flex items-center py-3 pl-2 pr-2 rounded-md hover:bg-slate-50 mb-2 last:mb-0" key={`${index}_${account.name}`}>
            <div className="flex-1">{account.name}</div>
            <div className="px-2 rounded-full bg-red-100 hover:bg-red-300 cursor-pointer" onClick={handleRemove(account.id)}>x</div>
          </div>
        )}
      </div>
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
    <div className="w-full pb-4 border-b flex">
      <div className="flex flex-1">  
        <input value={name} className="px-2 w-1/4 mr-4" placeholder="Account Name" onChange={handleName} />
        <input value={stash} className="px-2 w-3/4 mr-2" placeholder="Account Id" onChange={handleStash} />
      </div>
      <button className="rounded-md bg-green-500 hover:bg-green-700 text-center py-2 px-4 appearance-none text-white" onClick={addAccountToList}>Add Account</button>
    </div>
  )
}