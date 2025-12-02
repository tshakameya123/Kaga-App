import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { sanitizeInput } from '../utils/security';

const MyAppointments = () => {
    const { backendUrl, token } = useContext(AppContext);
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [newDate, setNewDate] = useState(new Date());
    const [newTime, setNewTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [activeTimePeriod, setActiveTimePeriod] = useState('morning');
    const [slotsByPeriod, setSlotsByPeriod] = useState({ morning: [], afternoon: [], evening: [] });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_');
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2];
    }

    // Function to format time - handles both 24-hour (14:00) and 12-hour (2:00 PM) formats
    const formatTime = (timeString) => {
        if (!timeString) return '';
        // If already in 12-hour format, return as is
        if (timeString.includes('AM') || timeString.includes('PM')) {
            return timeString;
        }
        // Convert 24-hour to 12-hour
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    // Function to fetch available slots for rescheduling from backend API
    const fetchAvailableSlots = async (date) => {
        if (!selectedAppointment) return;

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const slotDate = `${day}_${month}_${year}`;

        try {
            const { data } = await axios.post(`${backendUrl}/api/schedule/available-slots`, {
                doctorId: selectedAppointment.docData._id,
                date: slotDate
            });

            if (data.success) {
                // Use allSlots for the flat list and slots for grouped periods
                setAvailableSlots(data.allSlots || []);
                setSlotsByPeriod(data.slots || { morning: [], afternoon: [], evening: [] });
            } else {
                // Fallback to local generation if API fails
                generateLocalSlots(date);
            }
        } catch (error) {
            console.error('Error fetching slots from API:', error);
            // Fallback to local generation
            generateLocalSlots(date);
        }

        setNewTime(''); // Reset time selection
    };

    // Fallback local slot generation (used when API fails)
    const generateLocalSlots = (date) => {
        const slots = [];
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const slotDate = `${day}_${month}_${year}`;
        const bookedSlots = selectedAppointment.docData.slots_booked?.[slotDate] || [];

        // Generate slots from 8 AM to 9 PM in 12-hour format
        for (let h = 8; h < 21; h++) {
            for (let m = 0; m < 60; m += 30) {
                const period = h >= 12 ? 'PM' : 'AM';
                const hour12 = h % 12 || 12;
                const slotTime = `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
                
                if (!bookedSlots.includes(slotTime)) {
                    slots.push(slotTime);
                }
            }
        }

        setAvailableSlots(slots);
        
        // Group slots by period
        const grouped = { morning: [], afternoon: [], evening: [] };
        slots.forEach(slot => {
            if (slot.includes('AM') && !slot.startsWith('12:')) {
                grouped.morning.push(slot);
            } else if (slot.includes('PM') && (slot.startsWith('12:') || parseInt(slot) < 5)) {
                grouped.afternoon.push(slot);
            } else {
                grouped.evening.push(slot);
            }
        });
        setSlotsByPeriod(grouped);
    };

    // Handle date change for reschedule
    const handleDateChange = (date) => {
        setNewDate(date);
        fetchAvailableSlots(date);
    }

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        try {
            const { data } = await axios.get(
                backendUrl + '/api/user/appointments', 
                { 
                    headers: { token },
                    timeout: 15000,
                }
            );
            if (data.success) {
                setAppointments(data.appointments.reverse());
            } else {
                toast.error(data.message || 'Failed to fetch appointments');
            }
        } catch (error) {
            console.error('[Appointments] Fetch error:', error);
            const status = error.response?.status;
            if (status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else if (status === 429) {
                toast.error('Too many requests. Please wait a moment.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch appointments');
            }
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {
        if (!appointmentId) {
            toast.error('Invalid appointment');
            return;
        }

        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/cancel-appointment', 
                { appointmentId: sanitizeInput(appointmentId) }, 
                { 
                    headers: { token },
                    timeout: 15000,
                }
            );

            if (data.success) {
                toast.success(data.message);
                getUserAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('[Appointments] Cancel error:', error);
            const status = error.response?.status;
            if (status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else if (status === 429) {
                toast.error('Too many requests. Please wait a moment.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to cancel appointment');
            }
        }
    }

    const rescheduleAppointment = async () => {
        if (!selectedAppointment?._id || !newTime) {
            toast.error('Please select a valid time slot');
            return;
        }

        try {
            // Format the date properly for the API
            const day = newDate.getDate();
            const month = newDate.getMonth() + 1;
            const year = newDate.getFullYear();
            const formattedDate = `${day}_${month}_${year}`;
    
            const { data } = await axios.post(
                backendUrl + '/api/user/reschedule-appointment', 
                { 
                    appointmentId: sanitizeInput(selectedAppointment._id), 
                    newDate: sanitizeInput(formattedDate), 
                    newTime: sanitizeInput(newTime) 
                }, 
                { 
                    headers: { token },
                    timeout: 15000,
                }
            );
    
            if (data.success) {
                toast.success(data.message);
                getUserAppointments();
                setSelectedAppointment(null); // Close reschedule modal
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('[Appointments] Reschedule error:', error);
            const status = error.response?.status;
            if (status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else if (status === 429) {
                toast.error('Too many requests. Please wait a moment.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
            }
        }
    }
    

    useEffect(() => {
        if (token) {
            getUserAppointments();
        }
    }, [token]);

    // Fetch available slots when appointment is selected for rescheduling
    useEffect(() => {
        if (selectedAppointment) {
            fetchAvailableSlots(newDate);
        }
    }, [selectedAppointment]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-4 sm:py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage and track your medical appointments</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                            <span>Upcoming: {appointments.filter(apt => !apt.cancelled && !apt.isCompleted).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                            <span>Completed: {appointments.filter(apt => apt.isCompleted).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                            <span>Cancelled: {appointments.filter(apt => apt.cancelled).length}</span>
                        </div>
                    </div>
                </div>

                {/* Ultra-Compact Appointments Grid */}
                {appointments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {appointments.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
                                {/* Status Indicator */}
                                <div className={`h-0.5 w-full ${
                                    item.isCompleted ? 'bg-green-500' : 
                                    item.cancelled ? 'bg-red-500' : 'bg-blue-500'
                                }`}></div>
                                
                                <div className="p-3">
                                    {/* Ultra-Compact Doctor Info */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="relative flex-shrink-0">
                                            <img 
                                                className="w-8 h-8 rounded-md object-cover border border-gray-200" 
                                                src={item.docData.image} 
                                                alt={item.docData.name} 
                                            />
                                            <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border border-white flex items-center justify-center ${
                                                item.isCompleted ? 'bg-green-500' : 
                                                item.cancelled ? 'bg-red-500' : 'bg-blue-500'
                                            }`}>
                                                {item.isCompleted ? (
                                                    <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : item.cancelled ? (
                                                    <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xs font-bold text-gray-900 truncate">{item.docData.name}</h3>
                                            <p className="text-blue-600 font-medium text-xs truncate">{item.docData.speciality}</p>
                                        </div>
                                    </div>

                                    {/* Ultra-Compact Appointment Details */}
                                    <div className="bg-gray-50 rounded-md p-2 mb-3">
                                        <div className="grid grid-cols-2 gap-2 text-center">
                                            <div>
                                                <div className="flex items-center justify-center w-4 h-4 bg-blue-100 rounded mb-1 mx-auto">
                                                    <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="text-xs text-gray-600 mb-0.5">Date</div>
                                                <div className="text-xs font-bold text-gray-900">{slotDateFormat(item.slotDate)}</div>
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center justify-center w-4 h-4 bg-green-100 rounded mb-1 mx-auto">
                                                    <svg className="w-2 h-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="text-xs text-gray-600 mb-0.5">Time</div>
                                                <div className="text-xs font-bold text-gray-900">{formatTime(item.slotTime)}</div>
                                            </div>
                                        </div>
                                        
                                        {/* Compact Status Badge */}
                                        <div className="mt-2 flex justify-center">
                                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                item.isCompleted 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : item.cancelled 
                                                    ? 'bg-red-100 text-red-700' 
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {item.isCompleted ? (
                                                    <>
                                                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Done
                                                    </>
                                                ) : item.cancelled ? (
                                                    <>
                                                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                        Cancelled
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                        </svg>
                                                        Upcoming
                                </>
                            )}
                                            </div>
                                        </div>
                                        
                                        {item.payment && (
                                            <div className="mt-1 flex justify-center">
                                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                    <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    Paid
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Ultra-Compact Action Buttons */}
                                    <div className="space-y-1.5">
                                        {item.isCompleted && (
                                            <div className="w-full py-1.5 px-2 bg-green-50 text-green-700 rounded text-center text-xs font-medium border border-green-200">
                                                <div className="flex items-center justify-center gap-1">
                                                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Completed</span>
                                                </div>
                                            </div>
                                        )}

                                        {!item.cancelled && !item.isCompleted && (
                                            <div className="grid grid-cols-2 gap-1.5">
                                                <button 
                                                    onClick={() => { setSelectedAppointment(item); }} 
                                                    className="py-1.5 px-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-1"
                                                >
                                                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="truncate">Reschedule</span>
                                                </button>
                                                <button 
                                                    onClick={() => cancelAppointment(item._id)} 
                                                    className="py-1.5 px-2 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-1"
                                                >
                                                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    <span className="truncate">Cancel</span>
                                                </button>
                                            </div>
                                        )}

                                        {item.cancelled && !item.isCompleted && (
                                            <div className="space-y-1.5">
                                                <button 
                                                    onClick={() => { setSelectedAppointment(item); }} 
                                                    className="w-full py-1.5 px-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-1"
                                                >
                                                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>Reschedule</span>
                                                </button>
                                                <div className="w-full py-1.5 px-2 bg-red-50 text-red-700 rounded text-center text-xs font-medium border border-red-200">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Cancelled</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 sm:py-16">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">You don't have any appointments yet. Book your first appointment to get started.</p>
                        <button 
                            onClick={() => navigate('/doctors')} 
                            className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
                        >
                            Book Appointment
                        </button>
                    </div>
                )}
            </div>

            {/* Reschedule Modal */}
            {selectedAppointment && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4'>
                    <div className='bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 rounded-t-2xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg sm:text-2xl font-bold">Reschedule Appointment</h2>
                                    <p className="text-blue-100 mt-1 text-xs sm:text-base">
                                        Current: {slotDateFormat(selectedAppointment.slotDate)} at {formatTime(selectedAppointment.slotTime)}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setSelectedAppointment(null); setNewTime(''); setAvailableSlots([]); setSlotsByPeriod({ morning: [], afternoon: [], evening: [] }); }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors sm:hidden"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {/* Doctor Info */}
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                                <img 
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200" 
                                    src={selectedAppointment.docData.image} 
                                    alt="Doctor" 
                                />
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{selectedAppointment.docData.name}</h3>
                                    <p className="text-sm sm:text-base text-gray-600">{selectedAppointment.docData.speciality}</p>
                                </div>
                            </div>

                            {/* Date and Time Selection */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Date Selection */}
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-4">Select New Date:</label>
                                    <DatePicker
                                        selected={newDate}
                                        onChange={handleDateChange}
                                        minDate={new Date()}
                                        maxDate={new Date(new Date().setDate(new Date().getDate() + 6))}
                                        className="p-4 border-2 border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </div>

                                {/* Time Selection */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-lg font-semibold text-gray-700">Select New Time:</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span>{availableSlots.length} slots available</span>
                                        </div>
                                    </div>
                                    
                                    {availableSlots.length > 0 ? (
                                        <div className="space-y-3">
                                            {/* Time Period Tabs */}
                                            <div className="flex bg-gray-100 rounded-xl p-1">
                                                <button
                                                    onClick={() => setActiveTimePeriod('morning')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        activeTimePeriod === 'morning'
                                                            ? 'bg-white text-blue-600 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <span>Morning</span>
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                        {slotsByPeriod.morning.length}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setActiveTimePeriod('afternoon')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        activeTimePeriod === 'afternoon'
                                                            ? 'bg-white text-blue-600 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <span>Afternoon</span>
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                        {slotsByPeriod.afternoon.length}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setActiveTimePeriod('evening')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        activeTimePeriod === 'evening'
                                                            ? 'bg-white text-blue-600 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                    </svg>
                                                    <span>Evening</span>
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                        {slotsByPeriod.evening.length}
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Time Slots for Active Period */}
                                            <div className="min-h-[150px] max-h-[200px] overflow-y-auto">
                                                {activeTimePeriod === 'morning' && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                            </svg>
                                                            Morning Slots (8:00 AM - 12:00 PM)
                                                        </h4>
                                                        {slotsByPeriod.morning.length > 0 ? (
                                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                                {slotsByPeriod.morning.map((slot, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => setNewTime(slot)}
                                                                        className={`group relative px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                                                                            newTime === slot
                                                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg scale-105'
                                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            <span>{slot}</span>
                                                                        </div>
                                                                        {newTime === slot && (
                                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <p className="text-gray-500 text-sm">No morning slots available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {activeTimePeriod === 'afternoon' && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                            </svg>
                                                            Afternoon Slots (12:00 PM - 5:00 PM)
                                                        </h4>
                                                        {slotsByPeriod.afternoon.length > 0 ? (
                                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                                {slotsByPeriod.afternoon.map((slot, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => setNewTime(slot)}
                                                                        className={`group relative px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                                                                            newTime === slot
                                                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg scale-105'
                                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            <span>{slot}</span>
                                                                        </div>
                                                                        {newTime === slot && (
                                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <p className="text-gray-500 text-sm">No afternoon slots available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {activeTimePeriod === 'evening' && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                            </svg>
                                                            Evening Slots (5:00 PM - 9:00 PM)
                                                        </h4>
                                                        {slotsByPeriod.evening.length > 0 ? (
                                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                                {slotsByPeriod.evening.map((slot, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => setNewTime(slot)}
                                                                        className={`group relative px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                                                                            newTime === slot
                                                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg scale-105'
                                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            <span>{slot}</span>
                                                                        </div>
                                                                        {newTime === slot && (
                                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <p className="text-gray-500 text-sm">No evening slots available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Slots</h3>
                                            <p className="text-gray-500">Please select a different date to see available time slots.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                                <button 
                                    onClick={() => {
                                        setSelectedAppointment(null);
                                        setNewTime('');
                                        setAvailableSlots([]);
                                    }} 
                                    className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        console.log('Attempting to reschedule appointment with ID:', selectedAppointment._id);
                                        console.log('New Date:', newDate);
                                        console.log('New Time:', newTime);
                                        rescheduleAppointment();
                                    }} 
                                    disabled={!newTime}
                                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                                        newTime
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="hidden sm:inline">{newTime ? 'Confirm Reschedule' : 'Select a Time Slot'}</span>
                                    <span className="sm:hidden">{newTime ? 'Confirm' : 'Select Time'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyAppointments;
