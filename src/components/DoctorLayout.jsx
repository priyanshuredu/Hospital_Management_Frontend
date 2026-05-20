import React, { useState } from 'react';
import DoctorSidebar from './DoctorSidebar';
import DoctorHome from './DoctorHome';
import DoctorAppointments from './DoctorAppointments';
import EditProfile from './EditProfile';
import ResetPassword from './ResetPassword';
import { useTheme } from './ThemeContext';
import '../styles/DoctorLayout.css';

const DoctorLayout = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <DoctorHome />;
      case 'appointments':
        return <DoctorAppointments />;
      case 'edit-profile':
        return <EditProfile />;
      case 'reset-password':
        return <ResetPassword />;
      default:
        return <DoctorHome />;
    }
  };

  return (
    <div className={`doctor-main-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <DoctorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="doctor-main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default DoctorLayout;