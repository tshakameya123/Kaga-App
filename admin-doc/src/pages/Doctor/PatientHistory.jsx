import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const PatientHistory = () => {
  const { dToken, getPatients, patients } = useContext(DoctorContext)
  const { calculateAge } = useContext(AppContext)
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPatients, setFilteredPatients] = useState([])

  useEffect(() => {
    if (dToken) {
      getPatients()
    }
  }, [dToken])

  useEffect(() => {
    if (patients) {
      const filtered = patients.filter(patient => 
        patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.includes(searchQuery)
      )
      setFilteredPatients(filtered)
    }
  }, [patients, searchQuery])

  const handlePatientClick = (patientId) => {
    navigate(`/patient-history/${patientId}`)
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-gray-50 to-primary/5 p-3 sm:p-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-2'>My Patients</h1>
        <p className='text-gray-500 text-sm sm:text-base'>Click on a patient to view their complete medical history</p>
      </div>

      {/* Search Bar */}
      <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
        <div className='relative'>
          <svg className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
          <input
            type='text'
            placeholder='Search patients by name, email, or phone...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base'
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Patient Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6'>
        <div className='bg-white rounded-xl shadow-sm p-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
              <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
              </svg>
            </div>
            <div>
              <p className='text-xl sm:text-2xl font-bold text-gray-800'>{patients?.length || 0}</p>
              <p className='text-xs sm:text-sm text-gray-500'>Total Patients</p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm p-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
              <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p className='text-xl sm:text-2xl font-bold text-gray-800'>{filteredPatients?.length || 0}</p>
              <p className='text-xs sm:text-sm text-gray-500'>Showing</p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm p-4 hidden sm:block'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
              <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
              </svg>
            </div>
            <div>
              <p className='text-xl sm:text-2xl font-bold text-gray-800'>Active</p>
              <p className='text-xs sm:text-sm text-gray-500'>Status</p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm p-4 hidden sm:block'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
              <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p className='text-xl sm:text-2xl font-bold text-gray-800'>Today</p>
              <p className='text-xs sm:text-sm text-gray-500'>Last Updated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        <div className='px-4 py-3 bg-gray-50 border-b border-gray-100'>
          <h2 className='font-semibold text-gray-700'>Patient Directory</h2>
        </div>
        
        {filteredPatients.length === 0 ? (
          <div className='p-8 text-center'>
            <svg className='w-16 h-16 text-gray-300 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
            <h3 className='text-lg font-medium text-gray-600 mb-1'>No Patients Found</h3>
            <p className='text-gray-400 text-sm'>
              {searchQuery ? 'Try adjusting your search query' : 'You haven\'t seen any patients yet'}
            </p>
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {filteredPatients.map((patient, index) => (
              <div 
                key={patient._id || index}
                onClick={() => handlePatientClick(patient._id)}
                className='flex items-center gap-4 p-4 hover:bg-primary/5 cursor-pointer transition-all group'
              >
                {/* Patient Avatar */}
                <div className='relative'>
                  <img 
                    src={patient.image || 'https://via.placeholder.com/50'} 
                    alt={patient.name}
                    className='w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-md group-hover:border-primary transition-all'
                  />
                  <span className='absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full'></span>
                </div>

                {/* Patient Info */}
                <div className='flex-1 min-w-0'>
                  <h3 className='font-semibold text-gray-800 group-hover:text-primary transition-colors truncate'>
                    {patient.name}
                  </h3>
                  <div className='flex flex-wrap items-center gap-2 mt-1'>
                    <span className='text-xs text-gray-500 flex items-center gap-1'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                      </svg>
                      <span className='hidden sm:inline'>{patient.email}</span>
                      <span className='sm:hidden'>{patient.email?.split('@')[0]}</span>
                    </span>
                    {patient.phone && (
                      <span className='text-xs text-gray-500 flex items-center gap-1 hidden sm:flex'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                        </svg>
                        {patient.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Patient Meta */}
                <div className='text-right hidden sm:block'>
                  {patient.dob && (
                    <span className='text-sm text-gray-600'>
                      Age: {calculateAge(patient.dob)} yrs
                    </span>
                  )}
                  <p className='text-xs text-gray-400 capitalize'>
                    {patient.gender || 'Not specified'}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className='text-gray-300 group-hover:text-primary transition-colors'>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className='mt-6 text-center text-xs text-gray-400'>
        <p>Click on any patient to view their complete medical history and create new reports</p>
      </div>
    </div>
  )
}

export default PatientHistory
