import React, { useState } from 'react';
import UnifiedSidebar from './UnifiedSidebar';
import LabAssistantDashboard from './LabAssistantDashboard';
import LabTests from './LabTests';
import EditProfile from './EditProfile';
import ResetPassword from './ResetPassword';
import { useTheme } from './ThemeContext';
import AddTest from './AddTest';
import ManageTests from './ManageTests';
import '../styles/LabAssistantLayout.css';

// Import or define these components
const LabInfo = () => <div>Lab Info Component</div>;

const LabAssistantLayout = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <LabAssistantDashboard />;
      case 'lab-info':
        return <LabInfo />;
      case 'add-test':
        return <AddTest />;
      case 'manage-tests':
        return <ManageTests />;
      case 'pending-tests':
      case 'in-progress':
      case 'completed-tests':
      case 'all-tests':
        return <LabTests activeTab={activeTab} />;
      case 'generate-report':
      case 'view-reports':
      case 'approved-reports':
        return <div>Reports Component</div>;
      case 'edit-profile':
        return <EditProfile />;
      case 'reset-password':
        return <ResetPassword />;
      case 'notifications':
        return <div>Notifications Component</div>;
      default:
        return <LabAssistantDashboard />;
    }
  };

  return (
    <div className={`lab-assistant-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <UnifiedSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole="lab-assistant"
      />
      <main className="lab-main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default LabAssistantLayout;