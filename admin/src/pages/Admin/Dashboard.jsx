import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {

  const { aToken, getDashData, cancelAppointment, dashData, generateReport, appointments, doctors, getAllDoctors, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  const [reportData, setReportData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (aToken) {
      const loadData = async () => {
        setIsLoading(true)
        await Promise.all([
          getDashData(),
          getAllDoctors(),
          getAllAppointments()
        ])
        setIsLoading(false)
      }
      loadData()
    }
  }, [aToken])

  const handleGenerateReport = async () => {
    const report = await generateReport()
    setReportData(report)
  }

  // Calculate additional statistics with proper data validation
  const todayAppointments = appointments && appointments.length > 0 ? appointments.filter(apt => {
    if (!apt.slotDate) return false
    
    // Handle different date formats
    let aptDate
    if (typeof apt.slotDate === 'string') {
      // If it's a string like "15_10_2025", convert it
      if (apt.slotDate.includes('_')) {
        const [day, month, year] = apt.slotDate.split('_')
        aptDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else {
        aptDate = new Date(apt.slotDate)
      }
    } else {
      aptDate = new Date(apt.slotDate)
    }
    
    const today = new Date()
    const todayString = today.toDateString()
    const aptDateString = aptDate.toDateString()
    
    
    return aptDateString === todayString
  }).length : 0

  const thisWeekAppointments = appointments && appointments.length > 0 ? appointments.filter(apt => {
    if (!apt.slotDate) return false
    
    // Handle different date formats
    let aptDate
    if (typeof apt.slotDate === 'string') {
      // If it's a string like "15_10_2025", convert it
      if (apt.slotDate.includes('_')) {
        const [day, month, year] = apt.slotDate.split('_')
        aptDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else {
        aptDate = new Date(apt.slotDate)
      }
    } else {
      aptDate = new Date(apt.slotDate)
    }
    
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    
    return aptDate >= weekAgo && aptDate <= today
  }).length : 0

  const completedAppointments = appointments && appointments.length > 0 ? appointments.filter(apt => apt.isCompleted === true).length : 0
  const cancelledAppointments = appointments && appointments.length > 0 ? appointments.filter(apt => apt.cancelled === true).length : 0
  const upcomingAppointments = appointments && appointments.length > 0 ? appointments.filter(apt => apt.cancelled !== true && apt.isCompleted !== true).length : 0

  const availableDoctors = doctors && doctors.length > 0 ? doctors.filter(doc => doc.available === true).length : 0
  const unavailableDoctors = doctors && doctors.length > 0 ? doctors.filter(doc => doc.available === false).length : 0

  // Debug logging (simplified)
  console.log('Dashboard Stats:', {
    totalAppointments: appointments?.length || 0,
    todayAppointments,
    thisWeekAppointments,
    availableDoctors,
    upcomingAppointments
  })

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 p-4 sm:p-6 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600 text-lg'>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return dashData ? (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
          <div>
              <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2'>Admin Dashboard</h1>
              <p className='text-gray-600 text-sm sm:text-base'>Welcome back! Here's what's happening at your clinic today.</p>
            </div>
            <button
              onClick={() => {
                setIsLoading(true)
                Promise.all([
                  getDashData(),
                  getAllDoctors(),
                  getAllAppointments()
                ]).then(() => setIsLoading(false))
              }}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2'
            >
              <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8'>
          {/* Total Doctors */}
          <div className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                <img className='w-6 h-6' src={assets.doctor_icon} alt="" />
              </div>
              <div className='text-right'>
                <p className='text-2xl sm:text-3xl font-bold text-gray-900'>{dashData.doctors}</p>
                <p className='text-sm text-gray-500'>Total Doctors</p>
              </div>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-green-600 font-medium'>{availableDoctors} Available</span>
              <span className='text-red-500'>{unavailableDoctors} Unavailable</span>
            </div>
          </div>

          {/* Total Appointments */}
          <div className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                <img className='w-6 h-6' src={assets.appointments_icon} alt="" />
              </div>
              <div className='text-right'>
                <p className='text-2xl sm:text-3xl font-bold text-gray-900'>{dashData.appointments}</p>
                <p className='text-sm text-gray-500'>Total Appointments</p>
              </div>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-blue-600 font-medium'>{upcomingAppointments} Upcoming</span>
              <span className='text-green-600'>{completedAppointments} Completed</span>
            </div>
          </div>

          {/* Total Patients */}
          <div className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                <img className='w-6 h-6' src={assets.patients_icon} alt="" />
              </div>
              <div className='text-right'>
                <p className='text-2xl sm:text-3xl font-bold text-gray-900'>{dashData.patients}</p>
                <p className='text-sm text-gray-500'>Total Patients</p>
              </div>
            </div>
            <div className='text-sm text-gray-600'>
              <span className='font-medium'>Active patients in system</span>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
                <svg className='w-6 h-6 text-orange-600' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className='text-right'>
                <p className='text-2xl sm:text-3xl font-bold text-gray-900'>{todayAppointments}</p>
                <p className='text-sm text-gray-500'>Today's Appointments</p>
              </div>
            </div>
            <div className='text-sm text-gray-600'>
              <span className='font-medium'>{thisWeekAppointments} this week</span>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
          {/* Tab Navigation */}
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'recent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Activity
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className='p-6'>
            {activeTab === 'overview' && (
              <div className='space-y-6'>

                {/* Statistics Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {/* Appointment Status */}
                  <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>Appointment Status</h3>
                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Completed</span>
                        <span className='font-semibold text-green-600'>{completedAppointments}</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Upcoming</span>
                        <span className='font-semibold text-blue-600'>{upcomingAppointments}</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Cancelled</span>
                        <span className='font-semibold text-red-600'>{cancelledAppointments}</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Availability */}
                  <div className='bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>Doctor Availability</h3>
                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Available</span>
                        <span className='font-semibold text-green-600'>{availableDoctors}</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Unavailable</span>
                        <span className='font-semibold text-red-600'>{unavailableDoctors}</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Total</span>
                        <span className='font-semibold text-gray-900'>{dashData.doctors}</span>
        </div>
        </div>
      </div>

                  {/* Quick Actions */}
                  <div className='bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>Quick Actions</h3>
                    <div className='space-y-2'>
                      <button className='w-full text-left px-3 py-2 text-sm bg-white rounded-lg hover:bg-gray-50 transition-colors'>
                        View All Appointments
                      </button>
                      <button className='w-full text-left px-3 py-2 text-sm bg-white rounded-lg hover:bg-gray-50 transition-colors'>
                        Add New Doctor
                      </button>
                      <button className='w-full text-left px-3 py-2 text-sm bg-white rounded-lg hover:bg-gray-50 transition-colors'>
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Appointment Reports</h3>
                    <p className='text-sm text-gray-600'>Generate and view detailed reports</p>
        </div>
        <button
          onClick={handleGenerateReport}
                    className='bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2'
        >
                    <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
          Generate Report
        </button>
                </div>

        {reportData && (
                  <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4'>Report Summary</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                      <div className='bg-white rounded-lg p-4 text-center'>
                        <p className='text-2xl font-bold text-blue-600'>{reportData.totalAppointments}</p>
                        <p className='text-sm text-gray-600'>Total Appointments</p>
                      </div>
                      <div className='bg-white rounded-lg p-4 text-center'>
                        <p className='text-2xl font-bold text-green-600'>{reportData.totalCompleted}</p>
                        <p className='text-sm text-gray-600'>Completed</p>
                      </div>
                      <div className='bg-white rounded-lg p-4 text-center'>
                        <p className='text-2xl font-bold text-red-600'>{reportData.totalCancellations}</p>
                        <p className='text-sm text-gray-600'>Cancelled</p>
                      </div>
                      <div className='bg-white rounded-lg p-4 text-center'>
                        <p className='text-2xl font-bold text-orange-600'>{reportData.totalNoShows || 0}</p>
                        <p className='text-sm text-gray-600'>No Shows</p>
                      </div>
            </div>
          </div>
        )}
      </div>
            )}

            {activeTab === 'recent' && (
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>Latest Appointments</h3>
                  <p className='text-sm text-gray-600'>Recent booking activity</p>
        </div>

                <div className='bg-gray-50 rounded-xl overflow-hidden'>
                  {dashData.latestAppointments.slice(0, 8).map((item, index) => (
                    <div key={index} className='flex items-center justify-between p-4 hover:bg-white transition-colors duration-200 border-b border-gray-200 last:border-b-0'>
                      <div className='flex items-center gap-4'>
                        <img className='w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm' src={item.docData.image} alt="" />
                        <div>
                          <p className='font-medium text-gray-900'>{item.docData.name}</p>
                          <p className='text-sm text-gray-600'>Patient: {item.userData.name}</p>
                          <p className='text-xs text-gray-500'>Booking on {slotDateFormat(item.slotDate)} at {item.slotTime}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        {item.cancelled ? (
                          <span className='px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium'>Cancelled</span>
                        ) : item.isCompleted ? (
                          <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium'>Completed</span>
                        ) : (
                          <div className='flex items-center gap-2'>
                            <span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium'>Upcoming</span>
                            <button
                              onClick={() => cancelAppointment(item._id)}
                              className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200'
                              title='Cancel Appointment'
                            >
                              <img className='w-4 h-4' src={assets.cancel_icon} alt="" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  ) : (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 p-4 sm:p-6 flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg className='w-8 h-8 text-red-600' fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>No Data Available</h2>
        <p className='text-gray-600'>Unable to load dashboard data. Please try refreshing the page.</p>
      </div>
    </div>
  )
}

export default Dashboard
