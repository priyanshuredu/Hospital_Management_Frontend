import React, { useState } from 'react';
import HospitalSidebar from './HospitalSidebar';
import HospitalHome from './HospitalHome';
import DoctorRegistration from './DoctorRegistration';
import ManageDoctors from './ManageDoctors';
import EditProfile from './EditProfile';
import ResetPassword from './ResetPassword';
// import Hospitals from './Hospitals';
// import StateManagement from './StateManagement';
// import DistrictManagement from './DistrictManagement';
// import CityManagement from './CityManagement';
import DepartmentsManagement from './DepartmentManagement';
import { useTheme } from './ThemeContext';
import '../styles/HospitalLayout.css';
import LabManagement from './LabManagement';

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
    //   case 'state':
    //     return <StateManagement />;
    //   case 'district':
    //     return <DistrictManagement />;
    //   case 'city':
    //     return <CityManagement />;
      case 'departments':
        return <DepartmentsManagement />;
      case 'edit-profile':
        return <EditProfile />;
      case 'reset-password':
        return <ResetPassword />;
      default:
        return <HospitalHome />;
    }
  };

  return (
    <div className={`main-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <HospitalSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default HospitalLayout;