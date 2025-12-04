import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {

  const { aToken, appointments, cancelAppointment, deleteAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState(null)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  // Helper function to format time with AM/PM
  const formatTimeWithAMPM = (time) => {
    if (!time) return 'N/A'
    // If already has AM/PM, return as is
    if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
      return time
    }
    // Parse time and add AM/PM
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    if (isNaN(hour)) return time
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Helper to check if image is valid
  const isValidImage = (image) => {
    return image && image.trim() !== '' && (image.startsWith('http') || image.startsWith('data:image'))
  }

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (appointmentToDelete) {
      await deleteAppointment(appointmentToDelete._id)
      setShowDeleteModal(false)
      setAppointmentToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setAppointmentToDelete(null)
  }

  return (
    <div className='w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto'>

      {/* Header Section */}
      <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>All Appointments</h1>
            <p className='text-gray-500 text-sm mt-1'>Manage and monitor all appointments</p>
          </div>
          
          {/* Stats */}
          <div className='flex gap-3'>
            <div className='bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl px-4 py-2 border border-primary/30'>
              <p className='text-xl sm:text-2xl font-bold text-primary'>{appointments.length}</p>
              <p className='text-xs text-primary font-medium'>Total</p>
            </div>
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl px-4 py-2 border border-green-200'>
              <p className='text-xl sm:text-2xl font-bold text-green-600'>{appointments.filter(a => a.isCompleted).length}</p>
              <p className='text-xs text-green-600 font-medium'>Completed</p>
            </div>
            <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-xl px-4 py-2 border border-red-200'>
              <p className='text-xl sm:text-2xl font-bold text-red-600'>{appointments.filter(a => a.cancelled).length}</p>
              <p className='text-xs text-red-600 font-medium'>Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className='hidden md:block bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>#</th>
                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Patient</th>
                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Age</th>
                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Date & Time</th>
                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Doctor</th>
                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Fees</th>
                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Status</th>
                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-100'>
              {appointments.map((item, index) => (
                <tr key={index} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500'>{index + 1}</td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-3'>
                      {isValidImage(item.userData.image) ? (
                        <img src={item.userData.image} className='w-9 h-9 rounded-full object-cover border-2 border-gray-100' alt="" />
                      ) : (
                        <div className='w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-semibold'>
                          {item.userData.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                      )}
                      <span className='text-sm font-medium text-gray-900'>{item.userData.name}</span>
                    </div>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-600'>{calculateAge(item.userData.dob) || 'N/A'}</td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>{slotDateFormat(item.slotDate)}</div>
                    <div className='text-sm text-gray-500'>{formatTimeWithAMPM(item.slotTime)}</div>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-3'>
                      <img src={item.docData.image} className='w-9 h-9 rounded-full object-cover bg-gray-200 border-2 border-gray-100' alt="" />
                      <span className='text-sm font-medium text-gray-900'>{item.docData.name}</span>
                    </div>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{currency}{item.amount}</td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    {item.cancelled ? (
                      <span className='inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700'>Cancelled</span>
                    ) : item.isCompleted ? (
                      <span className='inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700'>Completed</span>
                    ) : (
                      <span className='inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700'>Pending</span>
                    )}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-1'>
                      {!item.cancelled && !item.isCompleted && (
                        <button 
                          onClick={() => cancelAppointment(item._id)} 
                          className='p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors'
                          title='Cancel Appointment'
                        >
                          <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteClick(item)} 
                        className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                        title='Delete Appointment'
                      >
                        <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className='md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {appointments.map((item, index) => (
          <div key={index} className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow'>
            {/* Status Badge */}
            <div className='flex justify-between items-start mb-3'>
              {item.cancelled ? (
                <span className='inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700'>Cancelled</span>
              ) : item.isCompleted ? (
                <span className='inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700'>Completed</span>
              ) : (
                <span className='inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700'>Pending</span>
              )}
              <div className='flex items-center gap-1'>
                {!item.cancelled && !item.isCompleted && (
                  <button 
                    onClick={() => cancelAppointment(item._id)} 
                    className='p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors'
                    title='Cancel'
                  >
                    <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteClick(item)} 
                  className='p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                  title='Delete'
                >
                  <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Patient Info */}
            <div className='flex items-center gap-3 mb-3 pb-3 border-b border-gray-100'>
              {isValidImage(item.userData.image) ? (
                <img src={item.userData.image} className='w-11 h-11 rounded-xl object-cover border-2 border-gray-100' alt="" />
              ) : (
                <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-lg font-semibold'>
                  {item.userData.name?.charAt(0).toUpperCase() || 'P'}
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-gray-900 truncate'>{item.userData.name}</p>
                <p className='text-xs text-gray-500'>Age: {calculateAge(item.userData.dob) || 'N/A'}</p>
              </div>
            </div>

            {/* Doctor Info */}
            <div className='flex items-center gap-3 mb-3'>
              <img src={item.docData.image} className='w-9 h-9 rounded-lg object-cover bg-gray-100 border border-gray-100' alt="" />
              <div className='min-w-0 flex-1'>
                <p className='text-xs text-gray-500'>Doctor</p>
                <p className='text-sm font-medium text-gray-900 truncate'>{item.docData.name}</p>
              </div>
            </div>

            {/* Date, Time & Fees */}
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <div className='flex items-center gap-1.5 text-gray-600'>
                <svg className='w-3.5 h-3.5 text-primary flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                </svg>
                <span>{slotDateFormat(item.slotDate)}</span>
              </div>
              <div className='flex items-center gap-1.5 text-gray-600'>
                <svg className='w-3.5 h-3.5 text-primary flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <span>{formatTimeWithAMPM(item.slotTime)}</span>
              </div>
              <div className='flex items-center gap-1.5 col-span-2'>
                <span className='text-gray-600'>Fee:</span>
                <span className='font-semibold text-primary'>{currency}{item.amount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-gray-800 mb-1'>No appointments found</h3>
          <p className='text-sm text-gray-500'>There are no appointments to display</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center mb-2">Delete Appointment</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              This action cannot be undone. Are you sure?
            </p>
            
            {appointmentToDelete && (
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-5">
                <div className="flex items-center gap-3">
                  {isValidImage(appointmentToDelete.userData.image) ? (
                    <img src={appointmentToDelete.userData.image} className="w-10 h-10 rounded-xl object-cover border border-gray-200" alt="" />
                  ) : (
                    <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold'>
                      {appointmentToDelete.userData.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{appointmentToDelete.userData.name}</p>
                    <p className="text-xs text-gray-500">
                      {slotDateFormat(appointmentToDelete.slotDate)} at {formatTimeWithAMPM(appointmentToDelete.slotTime)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Dr. {appointmentToDelete.docData.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AllAppointments
