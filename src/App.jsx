import React from 'react';
import { ThemeProvider } from './components/ThemeContext';
import MainLayout from './components/MainLayout';
import {BrowserRouter , Routes , Route} from 'react-router-dom'
import './App.css';
import Login from './components/Login';
import MainDashboard from './components/MainDashboard';
import HospitalRegistration from './components/HospitalRegistration';
import HospitalLayout from './components/HospitalLayout';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/' element={<MainDashboard/>}></Route>
        <Route path='/super-admin' element={<MainLayout />}></Route>
        <Route path='/hospital-registeration' element={<HospitalRegistration />}></Route>
        <Route path='/hospital' element={<HospitalLayout />}></Route>
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;