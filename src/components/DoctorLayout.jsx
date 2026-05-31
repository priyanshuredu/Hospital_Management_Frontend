import React, { useState } from 'react';
import UnifiedSidebar from './UnifiedSidebar';
import DoctorHome from './DoctorHome';
import DoctorAppointments from './DoctorAppointments';
import EditProfile from './EditProfile';
import ResetPassword from './ResetPassword';
import { useTheme } from './ThemeContext';
import '../styles/DoctorLayout.css';
import AppointmentHistory from './AppointmentHistory';
import PrescriptionsList from './PrescriptionsList';

const DoctorLayout = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <DoctorHome />;
      case 'appointments':
        return <DoctorAppointments />;
      case 'patients':
        return <AppointmentHistory/>;
      case 'prescriptions':
        return <PrescriptionsList/>;
      case 'edit-profile':
        return <EditProfile />;
      case 'reset-password':
        return <ResetPassword />;
      case 'notifications':
        return <div>Notifications Component</div>;
      default:
        return <DoctorHome />;
    }
  };

  return (
    <div className={`doctor-main-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <UnifiedSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole="doctor"
      />
      <main className="doctor-main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default DoctorLayout;