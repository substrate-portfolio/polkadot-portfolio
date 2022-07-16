import React from 'react';
import useBackgroundFetch from '../../hooks/useBackgroundFetch';
import Dashboard from '../../views/Dashboard';
function App() {
	useBackgroundFetch();

	return (
		<div className="relative bg-white h-screen flex flex-col">
			<Dashboard />
		</div>
	);
}

export default App;
