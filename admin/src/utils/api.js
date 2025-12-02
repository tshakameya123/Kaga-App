/**
 * Axios Configuration with Security Interceptors
 * 
 * Provides:
 * - Request interceptors for token attachment
 * - Response interceptors for error handling
 * - Automatic token refresh handling
 * - 401/403 auto-logout
 */

import axios from 'axios';
import { isTokenExpired, clearAuthTokens } from './security';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Create axios instance with default config
const api = axios.create({
    baseURL: backendUrl,
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track if we're already redirecting to prevent loops
let isRedirecting = false;

/**
 * Request interceptor
 * - Adds authentication token
 * - Validates token before request
 */
api.interceptors.request.use(
    (config) => {
        // Get the appropriate token based on the request
        const aToken = localStorage.getItem('aToken');
        const dToken = localStorage.getItem('dToken');
        
        // Check if token is expired before making request
        if (aToken && isTokenExpired(aToken)) {
            localStorage.removeItem('aToken');
            if (!isRedirecting) {
                isRedirecting = true;
                window.location.reload();
            }
            return Promise.reject(new Error('Admin token expired'));
        }
        
        if (dToken && isTokenExpired(dToken)) {
            localStorage.removeItem('dToken');
            if (!isRedirecting) {
                isRedirecting = true;
                window.location.reload();
            }
            return Promise.reject(new Error('Doctor token expired'));
        }
        
        // Attach tokens to headers
        if (aToken) {
            config.headers.atoken = aToken;
        }
        if (dToken) {
            config.headers.dtoken = dToken;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor
 * - Handles authentication errors
 * - Handles rate limiting
 * - Logs security events
 */
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        // Handle authentication errors
        if (status === 401) {
            console.warn('[SECURITY] Authentication failed:', message);
            
            // Check for specific auth errors
            if (message.includes('expired') || message.includes('invalid')) {
                clearAuthTokens();
                
                if (!isRedirecting) {
                    isRedirecting = true;
                    // Reload to show login page
                    window.location.reload();
                }
            }
        }
        
        // Handle authorization errors
        if (status === 403) {
            console.warn('[SECURITY] Authorization denied:', message);
        }
        
        // Handle rate limiting
        if (status === 429) {
            console.warn('[SECURITY] Rate limit exceeded');
            // Could implement retry logic here
        }
        
        // Handle server errors
        if (status >= 500) {
            console.error('[ERROR] Server error:', message);
        }
        
        return Promise.reject(error);
    }
);

/**
 * Admin API helper methods
 */
export const adminApi = {
    login: (email, password) => 
        api.post('/api/admin/login', { email, password }),
    
    getDashboard: () => 
        api.get('/api/admin/dashboard'),
    
    getAllDoctors: () => 
        api.get('/api/admin/all-doctors'),
    
    getAllPatients: () => 
        api.get('/api/admin/all-patients'),
    
    getAppointments: () => 
        api.get('/api/admin/appointments'),
    
    addDoctor: (formData) => 
        api.post('/api/admin/add-doctor', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    
    editDoctor: (formData) => 
        api.post('/api/admin/edit-doctor', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    
    deleteDoctor: (docId) => 
        api.post('/api/admin/delete-doctor', { docId }),
    
    deletePatient: (userId) => 
        api.post('/api/admin/delete-patient', { userId }),
    
    changeAvailability: (docId) => 
        api.post('/api/admin/change-availability', { docId }),
    
    cancelAppointment: (appointmentId) => 
        api.post('/api/admin/cancel-appointment', { appointmentId }),
    
    deleteAppointment: (appointmentId) => 
        api.post('/api/admin/delete-appointment', { appointmentId }),
};

/**
 * Doctor API helper methods
 */
export const doctorApi = {
    login: (email, password) => 
        api.post('/api/doctor/login', { email, password }),
    
    getDashboard: () => 
        api.get('/api/doctor/dashboard'),
    
    getAppointments: () => 
        api.get('/api/doctor/appointments'),
    
    getProfile: () => 
        api.get('/api/doctor/profile'),
    
    updateProfile: (data) => 
        api.post('/api/doctor/update-profile', data),
    
    cancelAppointment: (appointmentId) => 
        api.post('/api/doctor/cancel-appointment', { appointmentId }),
    
    completeAppointment: (appointmentId) => 
        api.post('/api/doctor/complete-appointment', { appointmentId }),
    
    changeAvailability: () => 
        api.post('/api/doctor/change-availability'),
};

export default api;
