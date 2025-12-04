import React, { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PatientDetail = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { dToken, backendUrl, appointments } = useContext(DoctorContext)
  const [patientHistory, setPatientHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [activeTab, setActiveTab] = useState('records')
  const [expandedReport, setExpandedReport] = useState(null)
  const [reportForm, setReportForm] = useState({
    chiefComplaint: '', diagnosis: '', treatment: '', prescription: '', notes: '',
    vitals: { bloodPressure: '', heartRate: '', temperature: '', weight: '' },
    followUpDate: '', followUpNotes: ''
  })

  const patientInfo = appointments.find(apt => apt.userId === patientId)?.userData
  const patientAppointments = appointments.filter(apt => apt.userId === patientId)
  const completedAppointments = patientAppointments.filter(apt => apt.isCompleted && !apt.cancelled)
  const upcomingAppointments = patientAppointments.filter(apt => !apt.isCompleted && !apt.cancelled)

  useEffect(() => {
    if (patientId && dToken) fetchPatientHistory()
  }, [patientId, dToken])

  const fetchPatientHistory = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post(`${backendUrl}/api/reports/patient-history`, { patientId }, { headers: { dToken } })
      if (data.success) setPatientHistory(data)
    } catch (error) {
      console.error('Error fetching patient history:', error)
    } finally {
      setLoading(false)
    }
  }

  const createVisitReport = async (e) => {
    e.preventDefault()
    if (!selectedAppointment) return toast.error('Please select an appointment')
    try {
      const { data } = await axios.post(`${backendUrl}/api/reports/visit/create`, {
        appointmentId: selectedAppointment._id, ...reportForm
      }, { headers: { dToken } })
      if (data.success) {
        toast.success('Report saved')
        setActiveTab('records')
        setReportForm({ chiefComplaint: '', diagnosis: '', treatment: '', prescription: '', notes: '',
          vitals: { bloodPressure: '', heartRate: '', temperature: '', weight: '' }, followUpDate: '', followUpNotes: '' })
        setSelectedAppointment(null)
        fetchPatientHistory()
      }
    } catch (error) { toast.error('Failed to save report') }
  }

  if (!patientInfo && !loading) {
    return (
      <div className='p-6 w-full min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <svg className='w-8 h-8 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
            </svg>
          </div>
          <h2 className='text-lg font-bold text-gray-800 mb-1'>Patient Not Found</h2>
          <p className='text-gray-500 text-sm mb-3'>This patient doesn't exist or you don't have access.</p>
          <button onClick={() => navigate('/patient-history')} className='px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600'>
            Back to Patients
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='p-2 sm:p-4 w-full min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto space-y-3'>
        
        {/* Header Row */}
        <div className='flex items-center justify-between'>
          <button onClick={() => navigate('/patient-history')}
            className='flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm text-gray-600 hover:bg-primary/5 hover:text-primary text-sm transition-colors'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Back
          </button>
          <span className='px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-1'>
            <span className='w-1.5 h-1.5 bg-primary rounded-full'></span> Active
          </span>
        </div>

        {loading ? (
          <div className='bg-white rounded-xl p-8 text-center shadow-sm'>
            <div className='animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto'></div>
            <p className='text-gray-500 mt-3 text-sm'>Loading...</p>
          </div>
        ) : (
          <>
            {/* Patient Card - Compact */}
            <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
              <div className='bg-gradient-to-r from-primary to-primary-dark px-4 py-3'>
                <div className='flex items-center gap-3'>
                  <img src={patientHistory?.patient?.image || patientInfo?.image || '/default-avatar.png'}
                    alt={patientInfo?.name} className='w-12 h-12 rounded-xl object-cover border-2 border-white/30' />
                  <div className='text-white flex-1 min-w-0'>
                    <h2 className='font-bold text-base truncate'>{patientHistory?.patient?.name || patientInfo?.name}</h2>
                    <p className='text-white/70 text-xs truncate'>{patientHistory?.patient?.email || patientInfo?.email}</p>
                  </div>
                  {(patientHistory?.patient?.phone || patientInfo?.phone) && (
                    <div className='hidden sm:flex items-center gap-1 text-white/70 text-xs'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                      </svg>
                      {patientHistory?.patient?.phone || patientInfo?.phone}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mini Stats */}
              <div className='grid grid-cols-3 divide-x divide-gray-100 text-center'>
                <div className='py-2'>
                  <p className='text-lg font-bold text-primary'>{patientHistory?.history?.completedAppointments || completedAppointments.length}</p>
                  <p className='text-[10px] text-gray-500 uppercase'>Visits</p>
                </div>
                <div className='py-2'>
                  <p className='text-xs font-medium text-gray-700 truncate px-2'>{patientHistory?.history?.lastVisit || 'N/A'}</p>
                  <p className='text-[10px] text-gray-500 uppercase'>Last Visit</p>
                </div>
                <div className='py-2'>
                  <p className='text-lg font-bold text-primary'>{patientHistory?.history?.reports?.length || 0}</p>
                  <p className='text-[10px] text-gray-500 uppercase'>Reports</p>
                </div>
              </div>
            </div>

            {/* Tabs - Compact */}
            <div className='bg-white rounded-xl shadow-sm p-1 flex gap-1'>
              {[
                { id: 'records', label: 'Records', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { id: 'appointments', label: 'Visits', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { id: 'new-report', label: 'New', icon: 'M12 4v16m8-8H4' }
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
                  }`}>
                  <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Records Tab */}
            {activeTab === 'records' && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between px-1'>
                  <h3 className='text-sm font-semibold text-gray-700'>Medical History</h3>
                  <span className='text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full'>
                    {patientHistory?.history?.reports?.length || 0} records
                  </span>
                </div>

                {patientHistory?.history?.reports?.length > 0 ? (
                  <div className='space-y-2'>
                    {patientHistory.history.reports.map((report, index) => (
                      <div key={report._id} className='bg-white rounded-xl shadow-sm overflow-hidden'>
                        <div onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                          className='p-3 cursor-pointer hover:bg-gray-50 transition-colors'>
                          <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                              <span className='text-primary font-bold text-sm'>#{patientHistory.history.reports.length - index}</span>
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2'>
                                <p className='text-sm font-medium text-gray-800 truncate'>
                                  {report.diagnosis || 'Visit Record'}
                                </p>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  report.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>{report.status}</span>
                              </div>
                              <p className='text-[11px] text-gray-500'>
                                {new Date(report.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {report.doctorId?.name && ` • Dr. ${report.doctorId.name}`}
                              </p>
                            </div>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedReport === report._id ? 'rotate-180' : ''}`}
                              fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                            </svg>
                          </div>
                        </div>

                        {expandedReport === report._id && (
                          <div className='border-t border-gray-100 p-3 bg-gray-50 space-y-2'>
                            {report.chiefComplaint && (
                              <div className='p-2 bg-red-50 rounded-lg border-l-3 border-red-400'>
                                <p className='text-[10px] font-bold text-red-600 uppercase'>Chief Complaint</p>
                                <p className='text-gray-800 text-xs mt-0.5'>{report.chiefComplaint}</p>
                              </div>
                            )}
                            <div className='grid grid-cols-2 gap-2'>
                              {report.diagnosis && (
                                <div className='p-2 bg-blue-50 rounded-lg'>
                                  <p className='text-[10px] font-bold text-blue-600 uppercase'>Diagnosis</p>
                                  <p className='text-gray-800 text-xs mt-0.5'>{report.diagnosis}</p>
                                </div>
                              )}
                              {report.treatment && (
                                <div className='p-2 bg-green-50 rounded-lg'>
                                  <p className='text-[10px] font-bold text-green-600 uppercase'>Treatment</p>
                                  <p className='text-gray-800 text-xs mt-0.5'>{report.treatment}</p>
                                </div>
                              )}
                            </div>
                            {report.prescription && (
                              <div className='p-2 bg-purple-50 rounded-lg'>
                                <p className='text-[10px] font-bold text-purple-600 uppercase'>Prescription</p>
                                <p className='text-gray-800 text-xs mt-1 font-mono whitespace-pre-wrap bg-white p-2 rounded border border-purple-100'>{report.prescription}</p>
                              </div>
                            )}
                            {report.vitals && (report.vitals.bloodPressure || report.vitals.heartRate || report.vitals.temperature || report.vitals.weight) && (
                              <div className='p-2 bg-orange-50 rounded-lg'>
                                <p className='text-[10px] font-bold text-orange-600 uppercase mb-1'>Vitals</p>
                                <div className='grid grid-cols-4 gap-1'>
                                  {report.vitals.bloodPressure && (
                                    <div className='bg-white p-1.5 rounded text-center'>
                                      <p className='text-sm font-bold text-gray-800'>{report.vitals.bloodPressure}</p>
                                      <p className='text-[9px] text-gray-500'>BP</p>
                                    </div>
                                  )}
                                  {report.vitals.heartRate && (
                                    <div className='bg-white p-1.5 rounded text-center'>
                                      <p className='text-sm font-bold text-gray-800'>{report.vitals.heartRate}</p>
                                      <p className='text-[9px] text-gray-500'>HR</p>
                                    </div>
                                  )}
                                  {report.vitals.temperature && (
                                    <div className='bg-white p-1.5 rounded text-center'>
                                      <p className='text-sm font-bold text-gray-800'>{report.vitals.temperature}°</p>
                                      <p className='text-[9px] text-gray-500'>Temp</p>
                                    </div>
                                  )}
                                  {report.vitals.weight && (
                                    <div className='bg-white p-1.5 rounded text-center'>
                                      <p className='text-sm font-bold text-gray-800'>{report.vitals.weight}</p>
                                      <p className='text-[9px] text-gray-500'>Wt(kg)</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {report.notes && (
                              <div className='p-2 bg-gray-100 rounded-lg'>
                                <p className='text-[10px] font-bold text-gray-600 uppercase'>Notes</p>
                                <p className='text-gray-700 text-xs mt-0.5'>{report.notes}</p>
                              </div>
                            )}
                            {(report.followUpDate || report.followUpNotes) && (
                              <div className='p-2 bg-indigo-50 rounded-lg border-l-3 border-indigo-500'>
                                <p className='text-[10px] font-bold text-indigo-600 uppercase'>Follow-up</p>
                                {report.followUpDate && (
                                  <p className='text-gray-800 text-xs font-medium mt-0.5'>
                                    📅 {new Date(report.followUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                )}
                                {report.followUpNotes && <p className='text-gray-600 text-xs mt-0.5'>{report.followUpNotes}</p>}
                              </div>
                            )}
                            <p className='text-[9px] text-gray-400 pt-1 border-t'>ID: {report._id?.slice(-8).toUpperCase()}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='bg-white rounded-xl p-6 text-center'>
                    <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                      <svg className='w-6 h-6 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                      </svg>
                    </div>
                    <h3 className='text-sm font-semibold text-gray-800'>No Records</h3>
                    <p className='text-gray-500 text-xs mb-3'>No visit records yet</p>
                    <button onClick={() => setActiveTab('new-report')}
                      className='px-4 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-primary-dark'>
                      Create Report
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className='space-y-3'>
                {upcomingAppointments.length > 0 && (
                  <div>
                    <h3 className='text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5'>
                      <span className='w-2 h-2 bg-primary rounded-full'></span> Upcoming
                    </h3>
                    <div className='space-y-1.5'>
                      {upcomingAppointments.map((apt) => (
                        <div key={apt._id} className='bg-white p-2.5 rounded-lg shadow-sm flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
                              <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-800'>{apt.slotDate}</p>
                              <p className='text-[10px] text-gray-500'>{apt.slotTime}</p>
                            </div>
                          </div>
                          <span className='px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium'>Scheduled</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className='text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5'>
                    <span className='w-2 h-2 bg-green-500 rounded-full'></span> Completed ({completedAppointments.length})
                  </h3>
                  {completedAppointments.length > 0 ? (
                    <div className='space-y-1.5'>
                      {completedAppointments.map((apt) => (
                        <div key={apt._id} className='bg-white p-2.5 rounded-lg shadow-sm flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                              <svg className='w-4 h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                              </svg>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-800'>{apt.slotDate}</p>
                              <p className='text-[10px] text-gray-500'>{apt.slotTime}</p>
                            </div>
                          </div>
                          <span className='px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium'>Done</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-gray-500 text-xs bg-white p-3 rounded-lg'>No completed visits</p>
                  )}
                </div>
              </div>
            )}

            {/* New Report Tab */}
            {activeTab === 'new-report' && (
              <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
                <div className='bg-gradient-to-r from-primary to-primary-dark px-4 py-3'>
                  <h3 className='font-bold text-white text-sm flex items-center gap-2'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                    </svg>
                    New Visit Report
                  </h3>
                </div>

                <form onSubmit={createVisitReport} className='p-4 space-y-4'>
                  {/* Appointment Selection */}
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>Select Appointment *</label>
                    <select value={selectedAppointment?._id || ''} required
                      onChange={(e) => setSelectedAppointment(completedAppointments.find(a => a._id === e.target.value))}
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50'>
                      <option value=''>Choose...</option>
                      {completedAppointments.map(apt => (
                        <option key={apt._id} value={apt._id}>{apt.slotDate} • {apt.slotTime}</option>
                      ))}
                    </select>
                    {completedAppointments.length === 0 && (
                      <p className='text-[10px] text-amber-600 mt-1'>⚠️ No completed appointments available</p>
                    )}
                  </div>

                  {/* Clinical Info */}
                  <div className='space-y-3'>
                    <p className='text-xs font-semibold text-gray-700 border-b pb-1'>Clinical Information</p>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <label className='block text-[10px] text-gray-500 mb-0.5'>Chief Complaint</label>
                        <input type='text' value={reportForm.chiefComplaint}
                          onChange={(e) => setReportForm({ ...reportForm, chiefComplaint: e.target.value })}
                          className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary'
                          placeholder="Primary concern" />
                      </div>
                      <div>
                        <label className='block text-[10px] text-gray-500 mb-0.5'>Diagnosis</label>
                        <input type='text' value={reportForm.diagnosis}
                          onChange={(e) => setReportForm({ ...reportForm, diagnosis: e.target.value })}
                          className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary'
                          placeholder="Diagnosis" />
                      </div>
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-500 mb-0.5'>Treatment</label>
                      <textarea value={reportForm.treatment} rows={2}
                        onChange={(e) => setReportForm({ ...reportForm, treatment: e.target.value })}
                        className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary'
                        placeholder="Treatment plan" />
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-500 mb-0.5'>Prescription</label>
                      <textarea value={reportForm.prescription} rows={2}
                        onChange={(e) => setReportForm({ ...reportForm, prescription: e.target.value })}
                        className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary'
                        placeholder="Drug - Dosage - Frequency - Duration" />
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className='space-y-2'>
                    <p className='text-xs font-semibold text-gray-700 border-b pb-1'>Vital Signs</p>
                    <div className='grid grid-cols-4 gap-2'>
                      <div>
                        <label className='block text-[9px] text-gray-500 mb-0.5'>BP</label>
                        <input type='text' value={reportForm.vitals.bloodPressure}
                          onChange={(e) => setReportForm({ ...reportForm, vitals: { ...reportForm.vitals, bloodPressure: e.target.value }})}
                          className='w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-primary'
                          placeholder="120/80" />
                      </div>
                      <div>
                        <label className='block text-[9px] text-gray-500 mb-0.5'>HR</label>
                        <input type='number' value={reportForm.vitals.heartRate}
                          onChange={(e) => setReportForm({ ...reportForm, vitals: { ...reportForm.vitals, heartRate: e.target.value }})}
                          className='w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-primary'
                          placeholder="72" />
                      </div>
                      <div>
                        <label className='block text-[9px] text-gray-500 mb-0.5'>Temp</label>
                        <input type='number' step='0.1' value={reportForm.vitals.temperature}
                          onChange={(e) => setReportForm({ ...reportForm, vitals: { ...reportForm.vitals, temperature: e.target.value }})}
                          className='w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-primary'
                          placeholder="36.5" />
                      </div>
                      <div>
                        <label className='block text-[9px] text-gray-500 mb-0.5'>Wt(kg)</label>
                        <input type='number' step='0.1' value={reportForm.vitals.weight}
                          onChange={(e) => setReportForm({ ...reportForm, vitals: { ...reportForm.vitals, weight: e.target.value }})}
                          className='w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-primary'
                          placeholder="70" />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className='block text-[10px] text-gray-500 mb-0.5'>Clinical Notes</label>
                    <textarea value={reportForm.notes} rows={2}
                      onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                      className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary'
                      placeholder="Additional observations..." />
                  </div>

                  {/* Follow-up */}
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-[10px] text-gray-500 mb-0.5'>Follow-up Date</label>
                      <input type='date' value={reportForm.followUpDate}
                        onChange={(e) => setReportForm({ ...reportForm, followUpDate: e.target.value })}
                        className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary' />
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-500 mb-0.5'>Instructions</label>
                      <input type='text' value={reportForm.followUpNotes}
                        onChange={(e) => setReportForm({ ...reportForm, followUpNotes: e.target.value })}
                        className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary'
                        placeholder="Return if..." />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 pt-2'>
                    <button type='button' onClick={() => setActiveTab('records')}
                      className='flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50'>
                      Cancel
                    </button>
                    <button type='submit' disabled={!selectedAppointment}
                      className='flex-1 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                      </svg>
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PatientDetail
