import React, { useCallback, useContext, useState } from "react";
import { AppContext } from "../../store";
import { FAddAccount, FRemoveAccount, IAccount } from "../../store/store";

interface AccountsListProps {
  accounts: IAccount[],
  removeAccount: FRemoveAccount,
}

const AccountsList = (props: AccountsListProps) => {
  const {accounts, removeAccount} = props;

  const handleRemove = useCallback((stash: string) => () => {
    removeAccount(stash);
  }, [removeAccount])

  if(accounts.length) return (
    <ul className="accountsList">
      {accounts.map((account, index) => <li onClick={handleRemove(account.id)} key={`${index}_${account.name}`}>{account.name}</li>)}
    </ul>
  )

  return <p>Please add some accounts</p>
}

interface AccountListModifyProps {
  addAccount: FAddAccount,
}

const AccountListModify = (props: AccountListModifyProps) => {
  const {addAccount} = props;
  const [name, setNameInput] = useState("")
  const [stash, setIdInput] = useState("")

  const addAccountToList = useCallback(async () => {
    addAccount({
      name,
      id: stash,
    });
  }, [addAccount, name, stash])

  const handleStash = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIdInput(event.target.value)
  }, [])

  const handleName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value)
  }, [])

  return (
    <div>
      <input placeholder="Account Name" onInput={handleName} />
      <input placeholder="Account Id" onInput={handleStash} />
      <button onClick={addAccountToList}>Add Account</button>
    </div>
  )
}

const Accounts = () => {
  const {state, actions} = useContext(AppContext);
  const { accounts } = state;
  const {removeAccount, addAccount} = actions;

  return (
    <div>
      <h1>Accounts:</h1>
      <AccountsList accounts={accounts} removeAccount={removeAccount}/>
      <AccountListModify addAccount={addAccount} />
    </div>
  )
}

export default Accounts;