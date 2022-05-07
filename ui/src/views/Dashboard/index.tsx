import React from "react";
import Networks from '../../components/Networks';
import {AccountsList, AccountListModify} from '../../components/Accounts';
import Assets from '../../components/Assets';

const Dashboard =  () => {
  return(
    <div className="w-full h-full flex">
      <div className="w-1/4 h-full bg-gray-50 border-r border-gray-100">
        <Networks />
      </div>
      <div className="w-3/4">
        <div className="p-4">
          <AccountListModify />
          <div className="flex">  
            <div className="w-1/5">
              <AccountsList />
            </div>
            <div className="w-4/5">
              <Assets/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;