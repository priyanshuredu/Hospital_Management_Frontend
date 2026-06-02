import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import MainLayout from './components/MainLayout';
import {BrowserRouter , Routes , Route} from 'react-router-dom'
import './App.css';
import Login from './components/Login';
import MainDashboard from './components/MainDashboard';
import HospitalRegistration from './components/HospitalRegistration';
import HospitalLayout from './components/HospitalLayout';
import NotAuthorized from './components/NotAuthorised';
import NotFound from './components/NotFound';
import ForgotPassword from './components/ForgotPassword';
import DoctorLayout from './components/DoctorLayout';
import LabAssistantLayout from './components/LabAssistantLayout';
import DoctorDetails from './components/DoctorDetails';
import TestReportHistory from './components/TestReportHistory';
import ResetPassword from './components/ResetPassword';
import EditProfile from './components/EditProfile';
import AppointmentHistory from './components/AppointmentHistory';
import TestReportDetails from './components/TestReportDetails';

function App() {
  const [role,setRole] = useState(null);
  const token = sessionStorage.getItem('token');

  useEffect(() =>{
    setRole(sessionStorage.getItem('role'));
  },[]);
  
  return (
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/' element={<MainDashboard/>}></Route>
        <Route path='/forgot-password' element={<ForgotPassword/>}></Route>
        <Route path='/hospital-registeration' element={<HospitalRegistration />}></Route>
        <Route path='/super-admin' element={role === 'admin' ? <MainLayout /> : <NotAuthorized/>}></Route>
        <Route path='/hospital' element={role === 'hospital-admin' ? <HospitalLayout /> : <NotAuthorized/>}></Route>
        <Route path='/doctor' element={role === 'doctor' ? <DoctorLayout/> : <NotAuthorized/>}></Route>
        <Route path='/lab' element={role === 'lab-assistant' ? <LabAssistantLayout/> : <NotAuthorized/>}></Route>
        <Route path="/doctor/:id" element={<DoctorDetails />} />
        <Route path='/my-reports' element={<TestReportHistory/>}></Route>
        <Route path='/reset-password' element={<ResetPassword/>}></Route>
        <Route path='/edit-profile' element={<EditProfile/>}></Route>
        <Route path='/test-report/:id' element={<TestReportDetails/>}></Route>
        <Route path='/appointment-history' element={<AppointmentHistory/>}></Route>
        <Route path='*' element={<NotFound/>}></Route>
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;