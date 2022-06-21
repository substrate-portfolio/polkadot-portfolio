import Header from "../../components/Header";
import Networks from '../../components/Networks';
import {AccountsList, AccountListModify, Accounts} from '../../components/Accounts';

const Sidebar = () => {
  return (
    <div className="w-1/4 h-full bg-gray-50 border-r border-gray-100">
      <Header />
      <Networks />
      <Accounts />
    </div>
  )
}

export default Sidebar;