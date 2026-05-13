import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Home from './Home';
import Hospitals from './Hospitals';
import StateManagement from './StateManagement';
import DistrictManagement from './DistrictManagement';
import CityManagement from './CityManagement';
import DepartmentsManagement from './DepartmentManagement';
// import AppointmentsManagement from './components/AppointmentsManagement';
// import SettingsManagement from './components/SettingsManagement';
import EditProfile from './EditProfile';
import ResetPassword from './ResetPassword';
// import Notifications from './Notifications';
// import Security from './Security';
import { useTheme } from './ThemeContext';
import '../styles/MainLayout.css';

const MainLayout = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <Home />;
      case 'hospital':
        return <Hospitals />;
      case 'state':
        return <StateManagement />;
      case 'district':
        return <DistrictManagement />;
      case 'city':
        return <CityManagement />;
      case 'departments':
        return <DepartmentsManagement />;
      // case 'appointments':
      //   return <AppointmentsManagement />;
      // case 'settings':
      //   return <SettingsManagement />;
      case 'edit-profile':
        return <EditProfile />;
      case 'reset-password':
        return <ResetPassword />;
      // case 'notifications':
      //   return <Notifications />;
      // case 'security':
      //   return <Security />;
      default:
        return <Home />;
    }
  };

  return (
    <div className={`main-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainLayout;