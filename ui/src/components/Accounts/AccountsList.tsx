import { faClose, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from 'classnames';
import { useCallback, useContext } from 'react';
import { AppContext } from '../../store';

const AccountsList = () => {
  const {state, actions} = useContext(AppContext);
  const { accounts, visibility } = state;
  const {accounts: hiddenAccounts} = visibility;
  const {removeAccount, changeVisibility} = actions;

  const handleRemove = useCallback((stash: string) => () => {
    removeAccount(stash);
  }, [removeAccount])

  const handleVisibility = useCallback((account: string) => () => {
    changeVisibility(account)
  }, [changeVisibility])

  if(accounts.length) return (
    <div className="py-1">
      {accounts.map((account, index) => 
        <div className="flex items-center py-2 rounded-md hover:bg-slate-50 mb-2 last:mb-0" key={`${index}_${account.name}`}>
          <div className="flex-1">{account.name}</div>
          
          <div className="inline-flex items-center">
            <div className="px-2 mr-2 rounded-ful cursor-pointer" onClick={handleVisibility(account.id)}>
              <FontAwesomeIcon icon={hiddenAccounts.includes(account.id) ? faEyeSlash : faEye} size="xs" className={classNames("text-gray-600 hover:text-cyan-500", {
                "text-cyan-500": hiddenAccounts.includes(account.id)
              })} />
            </div>
            <div className="px-2 rounded-full bg-red-100 hover:bg-red-300 cursor-pointer" onClick={handleRemove(account.id)}>
              <FontAwesomeIcon icon={faClose} size="xs" className="text-red-800" />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return <p>Please add some accounts</p>
}

export default AccountsList;
