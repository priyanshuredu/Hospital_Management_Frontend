import React from 'react';
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

function App() {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token')
  
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
        <Route path='/doctor' element={<DoctorLayout/>}></Route>
        <Route path='*' element={<NotFound/>}></Route>
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;