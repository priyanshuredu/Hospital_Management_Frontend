import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import StateManagement from './components/StateManagement';
import DistrictManagement from './components/DistrictManagement';
import CityManagement from './components/CityManagement';
import EditProfile from './components/EditProfile';
import ResetPassword from './components/ResetPassword';
import { ThemeProvider } from './components/ThemeContext';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <Home />;
      case 'state':
        return <StateManagement />;
      case 'district':
        return <DistrictManagement />;
      case 'city':
        return <CityManagement />;
      case 'edit-profile':
        return <EditProfile />;
      case 'reset-password':
        return <ResetPassword />;
      default:
        return <Home />;
    }
  };

  return (
    <ThemeProvider>
      <div className="app">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;