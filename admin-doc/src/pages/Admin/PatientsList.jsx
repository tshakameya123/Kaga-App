import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PatientsList = () => {
    const { aToken, backendUrl } = useContext(AdminContext)
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteModal, setDeleteModal] = useState({ open: false, patient: null })

    const getAllPatients = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/admin/all-patients', {
                headers: { aToken }
            })
            if (data.success) {
                setPatients(data.patients)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const deletePatient = async (userId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/delete-patient', { userId }, {
                headers: { aToken }
            })
            if (data.success) {
                toast.success(data.message)
                getAllPatients()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setDeleteModal({ open: false, patient: null })
    }

    useEffect(() => {
        if (aToken) {
            getAllPatients()
        }
    }, [aToken])

    // Filter patients based on search
    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
    )

    const formatDate = (dob) => {
        if (!dob || dob === 'Not Selected') return '-'
        return dob
    }

    const formatPhone = (phone) => {
        if (!phone || phone === '000000000') return '-'
        return phone
    }

    const formatGender = (gender) => {
        if (!gender || gender === 'Not Selected') return '-'
        return gender
    }

    const formatAddress = (address) => {
        if (!address) return '-'
        const parts = [address.line1, address.line2].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : '-'
    }

    return (
        <div className='w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto'>
            {/* Header Section */}
            <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div>
                        <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>Registered Patients</h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            Manage and view all registered patients
                        </p>
                    </div>
                    
                    {/* Stats Badge */}
                    <div className='flex gap-3'>
                        <div className='bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl px-4 py-2 border border-primary/30'>
                            <p className='text-xl sm:text-2xl font-bold text-primary'>{patients.length}</p>
                            <p className='text-xs text-primary font-medium'>Total Patients</p>
                        </div>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className='relative mt-4 sm:mt-6'>
                    <svg className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                    <input
                        type='text'
                        placeholder='Search by name, email or phone...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full sm:max-w-md pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all'
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className='flex justify-center items-center h-64'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
                </div>
            ) : (
                <>
                    {/* Patients List */}
                    {filteredPatients.length === 0 ? (
                        <div className='text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm'>
                            <svg className='mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' />
                            </svg>
                            <h3 className='mt-4 text-base sm:text-lg font-medium text-gray-900'>No patients found</h3>
                            <p className='mt-2 text-sm text-gray-500'>
                                {searchTerm ? 'Try adjusting your search criteria' : 'No patients have registered yet'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className='hidden md:block bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                                <div className='overflow-x-auto'>
                                    <table className='min-w-full divide-y divide-gray-200'>
                                        <thead className='bg-gray-50'>
                                            <tr>
                                                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>#</th>
                                                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Patient</th>
                                                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Contact</th>
                                                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Gender</th>
                                                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>DOB</th>
                                                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Address</th>
                                                <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className='bg-white divide-y divide-gray-100'>
                                            {filteredPatients.map((patient, index) => (
                                                <tr key={patient._id} className='hover:bg-gray-50 transition-colors'>
                                                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                        {index + 1}
                                                    </td>
                                                    <td className='px-4 py-4 whitespace-nowrap'>
                                                        <div className='flex items-center gap-3'>
                                                            {patient.image && patient.image.trim() !== '' && (patient.image.startsWith('http') || patient.image.startsWith('data:image')) ? (
                                                                <img
                                                                    src={patient.image}
                                                                    alt={patient.name}
                                                                    className='w-10 h-10 rounded-full object-cover border-2 border-gray-100'
                                                                />
                                                            ) : (
                                                                <div className='w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold'>
                                                                    {patient.name?.charAt(0).toUpperCase() || 'P'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className='text-sm font-medium text-gray-900'>{patient.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='px-4 py-4'>
                                                        <div className='text-sm text-gray-900'>{patient.email}</div>
                                                        <div className='text-sm text-gray-500'>{formatPhone(patient.phone)}</div>
                                                    </td>
                                                    <td className='px-4 py-4 whitespace-nowrap'>
                                                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                                            patient.gender === 'Male' 
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : patient.gender === 'Female'
                                                                    ? 'bg-pink-100 text-pink-700'
                                                                    : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {formatGender(patient.gender)}
                                                        </span>
                                                    </td>
                                                    <td className='px-4 py-4 whitespace-nowrap'>
                                                        <div className='text-sm text-gray-600'>{formatDate(patient.dob)}</div>
                                                    </td>
                                                    <td className='px-4 py-4'>
                                                        <div className='text-sm text-gray-600 max-w-xs truncate' title={formatAddress(patient.address)}>
                                                            {formatAddress(patient.address)}
                                                        </div>
                                                    </td>
                                                    <td className='px-4 py-4 whitespace-nowrap'>
                                                        <button
                                                            onClick={() => setDeleteModal({ open: true, patient })}
                                                            className='text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors'
                                                            title='Delete Patient'
                                                        >
                                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className='md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                {filteredPatients.map((patient, index) => (
                                    <div key={patient._id} className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow'>
                                        <div className='flex items-start gap-3'>
                                            {/* Patient Image */}
                                            <div className='flex-shrink-0'>
                                                {patient.image && patient.image.trim() !== '' && (patient.image.startsWith('http') || patient.image.startsWith('data:image')) ? (
                                                    <img
                                                        src={patient.image}
                                                        alt={patient.name}
                                                        className='w-14 h-14 rounded-xl object-cover border-2 border-gray-100'
                                                    />
                                                ) : (
                                                    <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-semibold'>
                                                        {patient.name?.charAt(0).toUpperCase() || 'P'}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Patient Info */}
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex items-start justify-between gap-2'>
                                                    <div className='min-w-0'>
                                                        <h3 className='text-base font-semibold text-gray-900 truncate'>
                                                            {patient.name}
                                                        </h3>
                                                        <p className='text-xs text-gray-500 truncate'>
                                                            {patient.email}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, patient })}
                                                        className='text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0'
                                                        title='Delete Patient'
                                                    >
                                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                                
                                        {/* Details Grid */}
                                        <div className='mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-y-2 gap-x-3 text-xs'>
                                            <div className='flex items-center gap-1.5 text-gray-600'>
                                                <svg className='w-3.5 h-3.5 text-primary flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                                </svg>
                                                <span className='truncate'>{formatPhone(patient.phone)}</span>
                                            </div>
                                            <div className='flex items-center justify-end'>
                                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                                    patient.gender === 'Male' 
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : patient.gender === 'Female'
                                                            ? 'bg-pink-100 text-pink-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {formatGender(patient.gender)}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-1.5 text-gray-600'>
                                                <svg className='w-3.5 h-3.5 text-primary flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                                </svg>
                                                <span className='truncate'>{formatDate(patient.dob)}</span>
                                            </div>
                                            <div className='flex items-center gap-1.5 text-gray-600 col-span-2'>
                                                <svg className='w-3.5 h-3.5 text-primary flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                                </svg>
                                                <span className='truncate'>{formatAddress(patient.address)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl'>
                        <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4'>
                            <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                            </svg>
                        </div>
                        <h3 className='text-lg sm:text-xl font-semibold text-gray-800 text-center mb-2'>Delete Patient</h3>
                        <p className='text-sm sm:text-base text-gray-500 text-center mb-6'>
                            Are you sure you want to delete <span className='font-semibold text-gray-700'>{deleteModal.patient?.name}</span>? 
                            This will also remove all their appointments.
                        </p>
                        <div className='flex gap-3'>
                            <button
                                onClick={() => setDeleteModal({ open: false, patient: null })}
                                className='flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deletePatient(deleteModal.patient._id)}
                                className='flex-1 px-4 py-2.5 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors font-medium'
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

export default PatientsList
