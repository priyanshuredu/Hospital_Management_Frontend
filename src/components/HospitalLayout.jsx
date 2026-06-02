import React, { useState } from 'react';
import UnifiedSidebar from './UnifiedSidebar';
import HospitalHome from './HospitalHome';
import DoctorRegistration from './DoctorRegistration';
import ManageDoctors from './ManageDoctors';
import EditProfile from './EditProfile';
import ResetPassword from './ResetPassword';
import DepartmentsManagement from './DepartmentManagement';
import LabManagement from './LabManagement';
import HospitalAppointments from './HospitalAppointments';
import { useTheme } from './ThemeContext';
import '../styles/HospitalLayout.css';
import DoctorsReport from './DoctorsReport';
import LabsReport from './LabsReport';
import AppointmentReport from './AppointmentReport';

const HospitalLayout = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <HospitalHome />;
      case 'add-doctor':
        return <DoctorRegistration />;
      case 'manage-doctors':
        return <ManageDoctors />;
      case 'lab':
        return <LabManagement />;
      case 'appointments':
        return <HospitalAppointments />;
      case 'departments':
        return <DepartmentsManagement />;
      case 'doctor-report':
        return <DoctorsReport/>;
      case 'lab-report':
        return <LabsReport/>;
      case 'appointment-report':
        return <AppointmentReport/>;
      case 'edit-profile':
        return <EditProfile />;
      case 'reset-password':
        return <ResetPassword />;
      case 'notifications':
        return <div>Notifications Component</div>;
      default:
        return <HospitalHome />;
    }
  };

  return (
    <div className={`main-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <UnifiedSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole="hospital-admin"
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default HospitalLayout;