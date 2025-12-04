import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Reports = () => {
  const { aToken, backendUrl } = useContext(AdminContext)
  const [loading, setLoading] = useState(true)
  const [appointmentStats, setAppointmentStats] = useState(null)
  const [patientStats, setPatientStats] = useState(null)
  const [dailySummary, setDailySummary] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

  const fetchAppointmentStats = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/reports/stats/appointments`, dateRange, {
        headers: { aToken }
      })
      if (data.success) {
        setAppointmentStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching appointment stats:', error)
    }
  }

  const fetchPatientStats = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/reports/stats/patients`, {}, {
        headers: { aToken }
      })
      if (data.success) {
        setPatientStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching patient stats:', error)
    }
  }

  const fetchDailySummary = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/reports/daily-summary`, {}, {
        headers: { aToken }
      })
      if (data.success) {
        setDailySummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error)
    }
  }

  const generateReport = async (type) => {
    try {
      toast.info('Generating report...')
      
      const { data } = await axios.post(`${backendUrl}/api/reports/generate`, {
        reportType: type,
        ...dateRange
      }, {
        headers: { aToken }
      })
      
      if (data.success) {
        // Create a comprehensive report object
        const report = {
          title: 'Kaga Health - Comprehensive Report',
          generatedAt: new Date().toLocaleString(),
          dateRange: dateRange.startDate && dateRange.endDate 
            ? `${dateRange.startDate} to ${dateRange.endDate}` 
            : 'All Time',
          appointmentStats: appointmentStats || {},
          patientStats: patientStats || {},
          dailySummary: dailySummary || {},
          rawData: data.report
        }

        // Format the report as readable text
        const reportText = `
═══════════════════════════════════════════════════════════════
                    KAGA HEALTH - CLINIC REPORT
═══════════════════════════════════════════════════════════════

Generated: ${report.generatedAt}
Period: ${report.dateRange}

───────────────────────────────────────────────────────────────
                      APPOINTMENT STATISTICS
───────────────────────────────────────────────────────────────

Total Appointments: ${appointmentStats?.totalAppointments || 0}
Completed: ${appointmentStats?.completedAppointments || 0} (${appointmentStats?.completionRate || 0}%)
Cancelled: ${appointmentStats?.cancelledAppointments || 0}
No-Show Rate: ${appointmentStats?.noShowRate || 0}%

Most Popular Specialities:
${appointmentStats?.mostPopularSpecialities?.map(([spec, count], i) => 
  `  ${i + 1}. ${spec}: ${count} appointments`
).join('\n') || '  No data available'}

───────────────────────────────────────────────────────────────
                       PATIENT STATISTICS
───────────────────────────────────────────────────────────────

Total Patients: ${patientStats?.totalPatients || 0}
New Patients This Month: ${patientStats?.newPatientsThisMonth || 0}
Average Visits Per Patient: ${patientStats?.averageVisitsPerPatient || 0}
Busiest Day: ${patientStats?.busiestDay || 'N/A'}

Visit Patterns by Day:
${patientStats?.visitPatterns ? Object.entries(patientStats.visitPatterns)
  .map(([day, count]) => `  ${day}: ${count} visits`)
  .join('\n') : '  No data available'}

Frequent Visitors:
${patientStats?.frequentVisitors?.map((v, i) => 
  `  ${i + 1}. ${v.name} (${v.email}): ${v.visitCount} visits`
).join('\n') || '  No data available'}

───────────────────────────────────────────────────────────────
                       TODAY'S SUMMARY
───────────────────────────────────────────────────────────────

Date: ${dailySummary?.date || new Date().toLocaleDateString()}
Total Today: ${dailySummary?.totalAppointments || 0}
Completed: ${dailySummary?.completedCount || 0}
Pending: ${dailySummary?.pendingCount || 0}

═══════════════════════════════════════════════════════════════
                      END OF REPORT
═══════════════════════════════════════════════════════════════
`

        // Create and download the file
        const blob = new Blob([reportText], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `KagaHealth_Report_${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success('Report downloaded successfully!')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    }
  }

  // Export as CSV function
  const exportAsCSV = () => {
    try {
      // Prepare CSV data
      let csvContent = 'Kaga Health Report\n'
      csvContent += `Generated,${new Date().toLocaleString()}\n\n`
      
      // Appointment Stats
      csvContent += 'APPOINTMENT STATISTICS\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Total Appointments,${appointmentStats?.totalAppointments || 0}\n`
      csvContent += `Completed,${appointmentStats?.completedAppointments || 0}\n`
      csvContent += `Completion Rate,${appointmentStats?.completionRate || 0}%\n`
      csvContent += `Cancelled,${appointmentStats?.cancelledAppointments || 0}\n`
      csvContent += `No-Show Rate,${appointmentStats?.noShowRate || 0}%\n\n`
      
      // Specialities
      csvContent += 'APPOINTMENTS BY SPECIALITY\n'
      csvContent += 'Speciality,Count\n'
      if (appointmentStats?.mostPopularSpecialities) {
        appointmentStats.mostPopularSpecialities.forEach(([spec, count]) => {
          csvContent += `${spec},${count}\n`
        })
      }
      csvContent += '\n'
      
      // Patient Stats
      csvContent += 'PATIENT STATISTICS\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Total Patients,${patientStats?.totalPatients || 0}\n`
      csvContent += `New This Month,${patientStats?.newPatientsThisMonth || 0}\n`
      csvContent += `Avg Visits Per Patient,${patientStats?.averageVisitsPerPatient || 0}\n`
      csvContent += `Busiest Day,${patientStats?.busiestDay || 'N/A'}\n\n`
      
      // Visit Patterns
      csvContent += 'VISIT PATTERNS BY DAY\n'
      csvContent += 'Day,Visits\n'
      if (patientStats?.visitPatterns) {
        Object.entries(patientStats.visitPatterns).forEach(([day, count]) => {
          csvContent += `${day},${count}\n`
        })
      }

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `KagaHealth_Report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('CSV exported successfully!')
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export CSV')
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      await Promise.all([
        fetchAppointmentStats(),
        fetchPatientStats(),
        fetchDailySummary()
      ])
      setLoading(false)
    }
    
    if (aToken) {
      fetchAllData()
    }
  }, [aToken])

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className={`bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm`}>
      <div className='flex items-center justify-between'>
        <div className='min-w-0 flex-1'>
          <p className='text-gray-500 text-xs sm:text-sm truncate'>{title}</p>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-1 ${color || 'text-gray-800'}`}>{value}</p>
          {subtitle && <p className='text-gray-400 text-xs mt-1 truncate'>{subtitle}</p>}
        </div>
        <div className='text-2xl sm:text-3xl lg:text-4xl ml-2 flex-shrink-0'>{icon}</div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='p-3 sm:p-5 lg:p-8 w-full min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6'>
          <div>
            <h1 className='text-xl sm:text-2xl font-semibold text-gray-800'>📊 Reports & Analytics</h1>
            <p className='text-gray-500 text-xs sm:text-sm mt-1'>Comprehensive insights into clinic performance</p>
          </div>
          <div className='flex gap-2 w-full sm:w-auto'>
            <button 
              onClick={() => generateReport('comprehensive')}
              className='flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-xs sm:text-sm flex items-center justify-center gap-1'
            >
              📄 Export TXT
            </button>
            <button 
              onClick={exportAsCSV}
              className='flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-1'
            >
              📊 Export CSV
            </button>
          </div>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className='bg-white rounded-xl p-1 mb-4 sm:mb-6 shadow-sm'>
          <div className='flex gap-1 overflow-x-auto scrollbar-hide'>
            {[
              { id: 'overview', label: '📈 Overview', shortLabel: '📈 Overview' },
              { id: 'appointments', label: '📅 Appointments', shortLabel: '📅 Appts' },
              { id: 'patients', label: '👥 Patients', shortLabel: '👥 Patients' },
              { id: 'daily', label: '📋 Daily', shortLabel: '📋 Daily' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[80px] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className='hidden sm:inline'>{tab.label}</span>
                <span className='sm:hidden'>{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='space-y-4 sm:space-y-6'>
            {/* Key Metrics */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              <StatCard 
                title="Total Appointments" 
                value={appointmentStats?.totalAppointments || 0}
                icon="📅"
                color="text-blue-600"
              />
              <StatCard 
                title="Completed" 
                value={appointmentStats?.completedAppointments || 0}
                subtitle={`${appointmentStats?.completionRate || 0}% rate`}
                icon="✅"
                color="text-green-600"
              />
              <StatCard 
                title="Cancelled" 
                value={appointmentStats?.cancelledAppointments || 0}
                subtitle={`${appointmentStats?.noShowRate || 0}% no-show`}
                icon="❌"
                color="text-red-600"
              />
              <StatCard 
                title="Total Patients" 
                value={patientStats?.totalPatients || 0}
                subtitle={`${patientStats?.newPatientsThisMonth || 0} new`}
                icon="👥"
                color="text-purple-600"
              />
            </div>

            {/* Two Column Layout for Desktop */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
              {/* Popular Specialities */}
              <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm'>
                <h3 className='font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base'>🏥 Most Popular Specialities</h3>
                <div className='space-y-3'>
                  {appointmentStats?.mostPopularSpecialities?.map(([specialty, count], index) => (
                    <div key={specialty} className='flex items-center gap-2 sm:gap-3'>
                      <span className='text-sm font-bold text-gray-400 w-6 flex-shrink-0'>#{index + 1}</span>
                      <div className='flex-1 min-w-0'>
                        <div className='flex justify-between items-center mb-1 gap-2'>
                          <span className='text-gray-700 text-xs sm:text-sm truncate'>{specialty}</span>
                          <span className='text-gray-500 text-xs sm:text-sm flex-shrink-0 font-medium'>{count}</span>
                        </div>
                        <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                          <div 
                            className='h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all'
                            style={{ width: `${Math.max(10, (count / (appointmentStats?.totalAppointments || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )) || <p className='text-gray-500 text-sm text-center py-4'>No data available</p>}
                </div>
              </div>

              {/* Visit Patterns */}
              <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm'>
                <h3 className='font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base'>📊 Visit Patterns by Day</h3>
                <div className='flex justify-between items-end gap-1 sm:gap-2 h-32 sm:h-40'>
                  {patientStats?.visitPatterns && Object.entries(patientStats.visitPatterns).map(([day, count]) => {
                    const maxCount = Math.max(...Object.values(patientStats.visitPatterns), 1);
                    const heightPercent = (count / maxCount) * 100;
                    return (
                      <div key={day} className='flex-1 flex flex-col items-center'>
                        <span className='text-xs sm:text-sm font-semibold text-gray-700 mb-1'>{count}</span>
                        <div className='w-full flex-1 flex items-end'>
                          <div 
                            className='w-full bg-gradient-to-t from-primary to-blue-400 rounded-t-lg transition-all min-h-[4px]'
                            style={{ height: `${Math.max(5, heightPercent)}%` }}
                          ></div>
                        </div>
                        <span className='text-[10px] sm:text-xs text-gray-500 mt-2 capitalize font-medium'>{day.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
                {patientStats?.busiestDay && (
                  <div className='mt-4 pt-3 border-t'>
                    <p className='text-gray-600 text-xs sm:text-sm'>
                      📈 Busiest day: <span className='font-semibold text-primary capitalize'>{patientStats.busiestDay}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className='space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm'>
              <h3 className='font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base'>📅 Appointment Statistics</h3>
              <div className='grid grid-cols-3 gap-2 sm:gap-4'>
                <div className='text-center p-3 sm:p-5 bg-blue-50 rounded-xl'>
                  <p className='text-2xl sm:text-4xl font-bold text-blue-600'>{appointmentStats?.totalAppointments || 0}</p>
                  <p className='text-gray-600 mt-1 text-xs sm:text-sm'>Total</p>
                </div>
                <div className='text-center p-3 sm:p-5 bg-green-50 rounded-xl'>
                  <p className='text-2xl sm:text-4xl font-bold text-green-600'>{appointmentStats?.completionRate || 0}%</p>
                  <p className='text-gray-600 mt-1 text-xs sm:text-sm'>Completed</p>
                </div>
                <div className='text-center p-3 sm:p-5 bg-red-50 rounded-xl'>
                  <p className='text-2xl sm:text-4xl font-bold text-red-600'>{appointmentStats?.noShowRate || 0}%</p>
                  <p className='text-gray-600 mt-1 text-xs sm:text-sm'>No-Show</p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm'>
              <h3 className='font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base'>📊 By Speciality</h3>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3'>
                {appointmentStats?.bySpeciality && Object.entries(appointmentStats.bySpeciality).map(([specialty, count]) => (
                  <div key={specialty} className='p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center border border-gray-100'>
                    <p className='text-xl sm:text-2xl font-bold text-primary'>{count}</p>
                    <p className='text-gray-600 text-xs sm:text-sm truncate mt-1'>{specialty}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className='space-y-4 sm:space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
              <StatCard 
                title="Total Patients" 
                value={patientStats?.totalPatients || 0}
                icon="👥"
              />
              <StatCard 
                title="New This Month" 
                value={patientStats?.newPatientsThisMonth || 0}
                icon="🆕"
                color="text-green-600"
              />
              <StatCard 
                title="Avg Visits/Patient" 
                value={patientStats?.averageVisitsPerPatient || 0}
                icon="📈"
              />
            </div>

            <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm'>
              <h3 className='font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base'>⭐ Frequent Visitors</h3>
              
              <div className='space-y-2 sm:space-y-3'>
                {patientStats?.frequentVisitors?.map((visitor, index) => (
                  <div key={visitor.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                        <span className='text-primary font-bold text-sm sm:text-base'>#{index + 1}</span>
                      </div>
                      <div className='min-w-0'>
                        <p className='font-medium text-gray-800 text-sm sm:text-base truncate'>{visitor.name}</p>
                        <p className='text-gray-500 text-xs sm:text-sm truncate'>{visitor.email}</p>
                      </div>
                    </div>
                    <span className='bg-primary text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ml-2'>
                      {visitor.visitCount} visits
                    </span>
                  </div>
                )) || (
                  <p className='text-center py-8 text-gray-500 text-sm'>No frequent visitors yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Daily Summary Tab */}
        {activeTab === 'daily' && (
          <div className='space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm'>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4'>
                <h3 className='font-semibold text-gray-800 text-sm sm:text-base'>📋 Today's Summary</h3>
                <span className='text-gray-500 text-xs sm:text-sm bg-gray-100 px-3 py-1 rounded-full'>{dailySummary?.date || 'Today'}</span>
              </div>
              
              <div className='grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6'>
                <div className='text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl'>
                  <p className='text-xl sm:text-3xl font-bold text-blue-600'>{dailySummary?.totalAppointments || 0}</p>
                  <p className='text-blue-600/70 mt-1 text-xs sm:text-sm font-medium'>Total</p>
                </div>
                <div className='text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl'>
                  <p className='text-xl sm:text-3xl font-bold text-green-600'>{dailySummary?.completedCount || 0}</p>
                  <p className='text-green-600/70 mt-1 text-xs sm:text-sm font-medium'>Done</p>
                </div>
                <div className='text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl'>
                  <p className='text-xl sm:text-3xl font-bold text-yellow-600'>{dailySummary?.pendingCount || 0}</p>
                  <p className='text-yellow-600/70 mt-1 text-xs sm:text-sm font-medium'>Pending</p>
                </div>
              </div>

              <h4 className='font-medium text-gray-700 mb-3 text-sm flex items-center gap-2'>
                <span className='w-1 h-4 bg-primary rounded-full'></span>
                By Doctor
              </h4>
              <div className='space-y-3'>
                {dailySummary?.byDoctor?.map((doctor) => (
                  <div key={doctor.doctorId} className='border border-gray-100 rounded-xl p-3 sm:p-4 bg-gray-50/50'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3'>
                      <div>
                        <p className='font-semibold text-gray-800 text-sm sm:text-base'>{doctor.doctorName}</p>
                        <p className='text-gray-500 text-xs sm:text-sm'>{doctor.speciality}</p>
                      </div>
                      <span className='bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium'>
                        {doctor.appointments.length} appointments
                      </span>
                    </div>
                    <div className='space-y-2'>
                      {doctor.appointments.map((apt, idx) => (
                        <div key={idx} className='flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100'>
                          <div className='flex items-center gap-2 sm:gap-3'>
                            <span className='font-mono text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded'>{apt.time}</span>
                            <span className='text-gray-800 text-xs sm:text-sm'>{apt.patient}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            apt.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )) || (
                  <div className='text-center py-8 text-gray-500'>
                    <p className='text-4xl mb-2'>📅</p>
                    <p className='text-sm'>No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
