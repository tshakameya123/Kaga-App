import React, { useContext, useEffect, useMemo, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, specialityData } from '../assets/assets'

const Doctors = () => {
    const { speciality } = useParams()
    const [filterDoc, setFilterDoc] = useState([])
    const [showFilter, setShowFilter] = useState(false)
    const navigate = useNavigate()
    const { availableDoctors } = useContext(AppContext)

    const specialityMeta = useMemo(() => ({
        'General physician': {
            description: 'Your first stop for everyday health concerns',
            accent: 'from-blue-500/90 to-sky-500/90'
        },
        'Gynecologist': {
            description: 'Comprehensive care for women at every stage',
            accent: 'from-pink-500/90 to-rose-500/90'
        },
        'Dermatologist': {
            description: 'Personalized skin, hair, and nail treatments',
            accent: 'from-purple-500/90 to-indigo-500/90'
        },
        'Pediatricians': {
            description: 'Gentle care for infants, toddlers, and teens',
            accent: 'from-amber-500/90 to-yellow-500/90'
        },
        'Neurologist': {
            description: 'Advanced brain and nervous system diagnostics',
            accent: 'from-indigo-600/90 to-blue-600/90'
        },
        'Gastroenterologist': {
            description: 'Digestive health support and preventative care',
            accent: 'from-emerald-500/90 to-teal-500/90'
        }
    }), [])

    const specialityCatalog = useMemo(() => specialityData.map((item) => ({
        ...item,
        description: specialityMeta[item.speciality]?.description || 'Specialist medical attention',
        accent: specialityMeta[item.speciality]?.accent || 'from-blue-500/90 to-cyan-500/90'
    })), [specialityMeta])

    const applyFilter = () => {
        if (speciality) {
            setFilterDoc(availableDoctors.filter(doc => doc.speciality === speciality))
        } else {
            setFilterDoc(availableDoctors)
        }
    }

    useEffect(() => {
        applyFilter()
    }, [availableDoctors, speciality])

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4'>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Browse Our Specialists</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Find the right medical specialist for your needs from our team of experienced doctors
                    </p>
                </div>

                <div className='flex flex-col lg:flex-row gap-6 lg:gap-8'>
                    {/* Mobile Filter Toggle */}
                    <button 
                        onClick={() => setShowFilter(!showFilter)} 
                        className={`lg:hidden flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                            showFilter 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow-md'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                        </svg>
                        {showFilter ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {/* Specialties Filter Sidebar */}
                    <div className={`lg:w-80 ${showFilter ? 'flex' : 'hidden lg:flex'} flex-col`}>
                        <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-4 sticky top-6">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-semibold">Specialties</p>
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Select by Expertise</h2>
                            <p className="text-[11px] text-gray-500 mb-3">
                                Tap any option to filter instantly.
                            </p>

                            <button
                                onClick={() => navigate('/doctors')}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border mb-4 transition ${
                                    !speciality
                                        ? 'border-blue-200 bg-blue-50 text-blue-900 shadow-inner'
                                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
                                }`}
                            >
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold">All Specialists</p>
                                    <p className="text-xs text-gray-500">Remove specialty filters</p>
                                </div>
                                {!speciality && (
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>

                            <div className="relative pl-8">
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-blue-100" />
                                <div className="space-y-3">
                                    {specialityCatalog.map((item, idx) => {
                                        const isActive = speciality === item.speciality
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => isActive ? navigate('/doctors') : navigate(`/doctors/${item.speciality}`)}
                                                className="relative w-full text-left focus:outline-none"
                                            >
                                                <span
                                                    className={`absolute -left-8 top-1 w-10 h-10 rounded-full border flex items-center justify-center bg-white ${
                                                        isActive ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]' : 'border-blue-200'
                                                    }`}
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.speciality}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                </span>

                                                <div className={`rounded-xl border p-2.5 transition ${
                                                    isActive
                                                        ? 'border-blue-200 bg-blue-50 shadow-inner'
                                                        : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/40'
                                                }`}>
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-medium text-[13px] text-gray-900">{item.speciality}</p>
                                                            {isActive && (
                                                                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-semibold">#{idx + 1}</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-tight">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] text-gray-600 flex items-center justify-between">
                                <span>Showing doctors</span>
                                <span className="font-semibold text-gray-900">{filterDoc.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Doctors Grid */}
                    <div className='flex-1'>
                        {filterDoc.length > 0 ? (
                            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
                                {filterDoc.map((item, index) => (
                                    <div 
                                        onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0); }} 
                                        className='bg-white rounded-2xl shadow-lg hover:shadow-xl cursor-pointer transform transition-all duration-300 hover:-translate-y-2 group border border-gray-50' 
                                        key={index}
                                    >
                                        <div className="relative p-3 pb-0">
                                            <div className="absolute inset-x-6 top-3 z-10 flex items-center justify-between">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-600 shadow-sm border border-gray-100">
                                                    {item.experience ? `${String(item.experience).match(/\d+/)?.[0] || item.experience}+ yrs exp.` : 'Experienced'}
                                                </span>
                                                <div className="flex items-center gap-1.5 bg-green-500/95 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                                                    <span className="w-2 h-2 rounded-full bg-white"></span>
                                                    <span>Available</span>
                                                </div>
                                            </div>
                                            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 border border-gray-100 shadow-inner aspect-[4/3]">
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 opacity-50 pointer-events-none" />
                                                <img 
                                                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                                                    src={item.image} 
                                                    alt={`${item.name}`} 
                                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = assets.profile_pic }}
                                                />
                                                <div className="absolute inset-0 pointer-events-none border border-white/40 rounded-2xl" />
                                            </div>
                                        </div>
                                        <div className='p-6'>
                                            <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200'>{item.name}</h3>
                                            <p className='text-blue-600 font-medium mb-4'>{item.speciality}</p>
                                            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                                {item.about || 'Dedicated specialist delivering compassionate care with modern techniques.'}
                                            </p>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>Book appointment</span>
                                                </div>
                                                <div className="flex items-center gap-2 font-semibold text-blue-600">
                                                    <span>View profile</span>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Doctors Found</h3>
                                <p className="text-gray-600 mb-6">No doctors available for the selected specialty. Try selecting a different specialty.</p>
                                <button 
                                    onClick={() => navigate('/doctors')} 
                                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                                >
                                    View All Doctors
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Doctors
