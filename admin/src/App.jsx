import React, { useContext } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import PatientsList from './pages/Admin/PatientsList';
import Notifications from './pages/Admin/Notifications';
import Reports from './pages/Admin/Reports';
import Login from './pages/login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorSchedule from './pages/Doctor/DoctorSchedule';
import DoctorNotifications from './pages/Doctor/DoctorNotifications';
import PatientHistory from './pages/Doctor/PatientHistory';
import PatientDetail from './pages/Doctor/PatientDetail';

const App = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  return dToken || aToken ? (
    <div className='bg-[#F8F9FD] min-h-screen'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <div className='flex-1 overflow-x-hidden'>
        <Routes>
          <Route path='/' element={<></>} />
          {/* Admin Routes */}
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path='/patients-list' element={<PatientsList />} />
          <Route path='/admin-notifications' element={<Notifications />} />
          <Route path='/admin-reports' element={<Reports />} />
          {/* Doctor Routes */}
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/doctor-schedule' element={<DoctorSchedule />} />
          <Route path='/doctor-notifications' element={<DoctorNotifications />} />
          <Route path='/patient-history' element={<PatientHistory />} />
          <Route path='/patient-history/:patientId' element={<PatientDetail />} />
        </Routes>
        </div>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  )
}

export default App