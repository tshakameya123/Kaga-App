import axios from "axios";
import { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // Simple token retrieval - just check if it exists
    const [aToken, setAToken] = useState(() => localStorage.getItem('aToken') || '')

    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [dashData, setDashData] = useState(false)

    // Logout handler
    const handleLogout = useCallback(() => {
        setAToken('');
        localStorage.removeItem('aToken');
        setAppointments([]);
        setDoctors([]);
        setDashData(false);
    }, []);

    // Centralized error handler
    const handleApiError = useCallback((error, action) => {
        console.error(`[Admin] ${action} error:`, error);
        
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        if (status === 401 || message?.includes('expired') || message?.includes('invalid')) {
            toast.error('Session expired. Please login again.');
            handleLogout();
            return;
        }
        
        if (status === 403) {
            toast.error('Access denied. Admin privileges required.');
            return;
        }
        
        if (status === 429) {
            toast.error('Too many requests. Please wait a moment.');
            return;
        }
        
        toast.error(message || `Failed to ${action}`);
    }, [handleLogout]);

    // Getting all Doctors data from Database using API
    const getAllDoctors = async () => {
        try {
            if (!aToken) return;
            
            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { 
                headers: { aToken },
                timeout: 15000,
            })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            handleApiError(error, 'fetch doctors');
        }
    }

    // Function to change doctor availablity using API
    const changeAvailability = async (docId) => {
        try {
            if (!aToken || !docId) return;

            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { 
                headers: { aToken },
                timeout: 15000,
            })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            handleApiError(error, 'change availability');
        }
    }

    // Function to delete a doctor using API
    const deleteDoctor = async (docId) => {
        try {
            if (!aToken || !docId) return;

            const { data } = await axios.post(backendUrl + '/api/admin/delete-doctor', { docId }, { 
                headers: { aToken },
                timeout: 15000,
            })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            handleApiError(error, 'delete doctor');
        }
    }

    // Function to edit a doctor using API
    const editDoctor = async (formData) => {
        try {
            if (!aToken) return false;

            const { data } = await axios.post(backendUrl + '/api/admin/edit-doctor', formData, { 
                headers: { 
                    aToken,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000,
            })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            handleApiError(error, 'edit doctor');
            return false
        }
    }

    // Getting all appointment data from Database using API
    const getAllAppointments = async () => {
        try {
            if (!aToken) return;

            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { 
                headers: { aToken },
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

    // Function to cancel appointment using API
    const cancelAppointment = async (appointmentId) => {
        try {
            if (!aToken || !appointmentId) return;

            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { 
                headers: { aToken },
                timeout: 15000,
            })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            handleApiError(error, 'cancel appointment');
        }
    }

    // Function to delete appointment permanently using API
    const deleteAppointment = async (appointmentId) => {
        try {
            if (!aToken || !appointmentId) return;

            const { data } = await axios.post(backendUrl + '/api/admin/delete-appointment', { appointmentId }, { 
                headers: { aToken },
                timeout: 15000,
            })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message || 'Failed to delete appointment')
            }
        } catch (error) {
            handleApiError(error, 'delete appointment');
        }
    }

    // Getting Admin Dashboard data from Database using API
    const getDashData = async () => {
        try {
            if (!aToken) return;

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { 
                headers: { aToken },
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

    // Generating the report
    const generateReport = async () => {
        try {
            if (!aToken) return null;

            const { data } = await axios.get(backendUrl + '/api/admin/generate-report', { 
                headers: { aToken },
                timeout: 30000,
            });
            if (data.success) {
                return data.reportData;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            handleApiError(error, 'generate report');
            return null;
        }
    };

    const value = {
        aToken, setAToken,
        backendUrl,
        doctors,
        getAllDoctors,
        changeAvailability,
        deleteDoctor,
        editDoctor,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        deleteAppointment,
        generateReport,
        dashData,
        handleLogout,
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider