import React from 'react';
import Assets from '../../components/Assets';
import Sidebar from './Sidebar';

const Dashboard = () => {
  return (
    <div className="w-full h-full flex">
      <Sidebar />
      <div className="w-3/4">
        <div className="p-4">
          <Assets />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
