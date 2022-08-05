import Header from '../../components/Header';
import Networks from '../../components/Networks';
import { Accounts } from '../../components/Accounts';
import About from '../../components/About';
import { RefObject, useEffect, useRef, useState } from 'react';

const Sidebar = () => {
	const headerHeight: RefObject<HTMLDivElement> = useRef(null);
	const aboutHeight: RefObject<HTMLDivElement> = useRef(null);
	const [hHeight, setHeaderHeight] = useState(58);
	const [aHeight, setAboutHeight] = useState(58);

	useEffect(() => {
		headerHeight.current && setHeaderHeight(headerHeight.current?.clientHeight);
		aboutHeight.current && setAboutHeight(aboutHeight.current?.clientHeight);
	}, [headerHeight, aboutHeight]);
	return (
		<div className="w-1/4 h-full border-r border-gray-100">
			<div className="fixed left-0 bg-gray-50 bottom-0 top-0 w-1/4 flex flex-col">
				<div ref={headerHeight}>
					<Header />
				</div>
				<div
					className="flex-1 flex flex-col"
					style={{
						height: `calc(100vh - ${hHeight + aHeight}px)`
					}}>
					<Networks />
					<Accounts />
				</div>
				<div ref={aboutHeight}>
					<About />
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
