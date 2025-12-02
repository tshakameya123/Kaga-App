import { createContext, useState, useCallback, useEffect } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // Simple token retrieval - just check if it exists
    const [dToken, setDToken] = useState(() => localStorage.getItem('dToken') || '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)
    const [patients, setPatients] = useState([])

    // Logout handler
    const handleLogout = useCallback(() => {
        setDToken('');
        localStorage.removeItem('dToken');
        setAppointments([]);
        setDashData(false);
        setProfileData(false);
    }, []);

    // Centralized error handler
    const handleApiError = useCallback((error, action) => {
        console.error(`[Doctor] ${action} error:`, error);
        
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        if (status === 401 || message?.includes('expired') || message?.includes('invalid')) {
            toast.error('Session expired. Please login again.');
            handleLogout();
            return;
        }
        
        if (status === 403) {
            toast.error('Access denied.');
            return;
        }
        
        if (status === 429) {
            toast.error('Too many requests. Please wait a moment.');
            return;
        }
        
        toast.error(message || `Failed to ${action}`);
    }, [handleLogout]);

    // Getting Doctor appointment data from Database using API
    const getAppointments = async () => {
        try {
            if (!dToken) return;

            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { 
                headers: { dToken },
                timeout: 15000,
            })

            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            handleApiError(error, 'fetch appointments');
        }
    }

    // Getting Doctor profile data from Database using API
    const getProfileData = async () => {
        try {
            if (!dToken) return;

            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { 
                headers: { dToken },
                timeout: 15000,
            })
            
            if (data.success) {
                setProfileData(data.profileData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            handleApiError(error, 'fetch profile');
        }
    }

    // Function to cancel doctor appointment using API
    const cancelAppointment = async (appointmentId) => {
        try {
            if (!dToken || !appointmentId) return;

            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { 
                headers: { dToken },
                timeout: 15000,
            })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            handleApiError(error, 'cancel appointment');
        }
    }

    // Function to Mark appointment completed using API
    const completeAppointment = async (appointmentId) => {
        try {
            if (!dToken || !appointmentId) return;

            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { 
                headers: { dToken },
                timeout: 15000,
            })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            handleApiError(error, 'complete appointment');
        }
    }

    // Getting Doctor dashboard data using API
    const getDashData = async () => {
        try {
            if (!dToken) return;

            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { 
                headers: { dToken },
                timeout: 15000,
            })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            handleApiError(error, 'fetch dashboard');
        }
    }

    // Get unique patients from appointments
    const getPatients = async () => {
        try {
            if (!dToken) return;
            
            // First make sure we have appointments
            if (appointments.length === 0) {
                await getAppointments()
            }
        } catch (error) {
            handleApiError(error, 'fetch patients');
        }
    }

    // Extract unique patients from appointments when appointments change
    useEffect(() => {
        const uniquePatients = []
        const seenIds = new Set()
        
        appointments.forEach(apt => {
            if (apt.userData && !seenIds.has(apt.userId)) {
                seenIds.add(apt.userId)
                uniquePatients.push({
                    _id: apt.userId,
                    ...apt.userData
                })
            }
        })
        
        setPatients(uniquePatients)
    }, [appointments])

    const value = {
        dToken, setDToken, backendUrl,
        appointments,
        getAppointments,
        cancelAppointment,
        completeAppointment,
        dashData, getDashData,
        profileData, setProfileData,
        getProfileData,
        handleLogout,
        patients,
        getPatients,
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider

