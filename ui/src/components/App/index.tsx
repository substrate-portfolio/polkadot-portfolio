import React from 'react';
import Dashboard from '../../views/Dashboard'
import Header from '../Header'
function App() {
  return (
    <div className='relative bg-white h-screen flex flex-col'>
      <Header />
      <Dashboard />
    </div>
  );
}

export default App;
