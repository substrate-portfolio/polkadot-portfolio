import Header from '../../components/Header';
import Networks from '../../components/Networks';
import { Accounts } from '../../components/Accounts';
import About from '../../components/About';

const Sidebar = () => {
	return (
		<div className="w-1/4 h-full bg-gray-50 border-r border-gray-100 flex flex-col">
			<Header />
			<Networks />
			<Accounts />
			<About />
		</div>
	);
};

export default Sidebar;
