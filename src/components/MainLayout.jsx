import React, { useState } from 'react';
import UnifiedSidebar from './UnifiedSidebar';
import Home from './Home';
import Hospitals from './Hospitals';
import StateManagement from './StateManagement';
import DistrictManagement from './DistrictManagement';
import CityManagement from './CityManagement';
import DepartmentsManagement from './DepartmentManagement';
import EditProfile from './EditProfile';
import ResetPassword from './ResetPassword';
import { useTheme } from './ThemeContext';
import '../styles/MainLayout.css';
import AppointmentHistory from './AppointmentHistory';
import HospitalReport from './HospitalReport';
import DoctorsReport from './DoctorsReport';
import LabsReport from './LabsReport';
import UsersReport from './UsersReport';

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
      case 'appointments':
        return <AppointmentHistory/>;
      case 'hospital-report':
        return <HospitalReport/>;
      case 'doctor-report':
        return <DoctorsReport/>;
      case 'lab-report':
        return <LabsReport/>;
      case 'user-report':
        return <UsersReport/>;
      case 'edit-profile':
        return <EditProfile />;
      case 'reset-password':
        return <ResetPassword />;
      case 'notifications':
        return <div>Notifications Component</div>;
      case 'security':
        return <div>Security Component</div>;
      default:
        return <Home />;
    }
  };

  return (
    <div className={`main-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <UnifiedSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole="admin"
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainLayout;