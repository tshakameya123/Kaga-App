import { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import { secureRetrieve, clearAuthTokens, isTokenExpired } from '../utils/security'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'UGX '
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(() => secureRetrieve('token') || '')
    const [userData, setUserData] = useState(false)

    // Centralized logout handler
    const handleLogout = useCallback(() => {
        setToken('');
        setUserData(false);
        clearAuthTokens();
    }, []);

    // Centralized error handler
    const handleApiError = useCallback((error, action) => {
        console.error(`[API] ${action} error:`, error);
        
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        // Handle authentication errors
        if (status === 401 || 
            message === 'User not found' || 
            message === 'Not Authorized Login Again' ||
            message === 'invalid signature' ||
            message?.toLowerCase().includes('invalid') ||
            message?.toLowerCase().includes('token') ||
            message?.toLowerCase().includes('expired')) {
            handleLogout();
            return true; // Indicates auth error was handled
        }
        
        if (status === 403) {
            toast.error('Access denied.');
            return true;
        }
        
        if (status === 429) {
            toast.error('Too many requests. Please wait a moment.');
            return true;
        }
        
        return false; // Error not handled
    }, [handleLogout]);

    // Check token validity periodically
    useEffect(() => {
        const checkTokenValidity = () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken && isTokenExpired(storedToken)) {
                console.warn('[Security] Token expired, logging out');
                handleLogout();
            }
        };

        // Check immediately
        checkTokenValidity();

        // Check every minute
        const interval = setInterval(checkTokenValidity, 60000);
        return () => clearInterval(interval);
    }, [handleLogout]);

    // Getting Doctors using API
    const getDoctosData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/list', {
                timeout: 15000,
            })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            if (!handleApiError(error, 'fetch doctors')) {
                toast.error(error.message || 'Failed to fetch doctors')
            }
        }

    }

    // Getting User Profile using API
    const loadUserProfileData = async () => {

        try {
            if (!token) return;

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { 
                headers: { token },
                timeout: 15000,
            })

            if (data.success) {
                setUserData(data.userData)
            } else {
                // If user not found or invalid token, clear the invalid token
                if (data.message === 'User not found' || 
                    data.message === 'Not Authorized Login Again' ||
                    data.message === 'invalid signature' ||
                    data.message?.toLowerCase().includes('invalid') ||
                    data.message?.toLowerCase().includes('token')) {
                    handleLogout();
                    // Don't show error toast for invalid tokens - just silently clear them
                } else {
                    toast.error(data.message)
                }
            }

        } catch (error) {
            if (!handleApiError(error, 'load profile')) {
                toast.error(error.response?.data?.message || error.message)
            }
        }

    }

    useEffect(() => {
        getDoctosData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token])

    // Filter available doctors
    const availableDoctors = doctors.filter(doc => doc.available === true)

    const value = {
        doctors, 
        availableDoctors, // Add filtered available doctors
        getDoctosData,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData,
        handleLogout,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider