/**
 * Client-side security utilities for the patient portal
 * These complement the server-side OWASP protections
 */

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
    const errors = [];
    
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        message: errors.join('. ')
    };
};

/**
 * Validate name input
 * @param {string} name - Name to validate
 * @returns {object} - Validation result
 */
export const validateName = (name) => {
    if (!name || name.trim().length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters long' };
    }
    if (name.length > 50) {
        return { isValid: false, message: 'Name must be less than 50 characters' };
    }
    // Allow only letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
        return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true, message: '' };
};

/**
 * Check if a JWT token format is valid (basic check)
 * @param {string} token - Token to validate
 * @returns {boolean} - Whether token format is valid
 */
export const isValidTokenFormat = (token) => {
    if (!token || typeof token !== 'string') return false;
    
    // JWT should have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Each part should be a valid base64url string
    const base64urlRegex = /^[A-Za-z0-9_-]+$/;
    return parts.every(part => base64urlRegex.test(part));
};

/**
 * Decode JWT token payload (client-side, not for validation)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null
 */
export const decodeToken = (token) => {
    try {
        if (!isValidTokenFormat(token)) return null;
        
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded;
    } catch (error) {
        console.error('[Security] Failed to decode token:', error);
        return null;
    }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - Whether token is expired
 */
export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    // Add 30 second buffer for clock skew
    return Date.now() >= (decoded.exp * 1000) - 30000;
};

/**
 * Securely store token in localStorage with validation
 * @param {string} key - Storage key
 * @param {string} token - Token to store
 * @returns {boolean} - Whether storage was successful
 */
export const secureStore = (key, token) => {
    try {
        if (!isValidTokenFormat(token)) {
            console.warn('[Security] Attempted to store invalid token format');
            return false;
        }
        localStorage.setItem(key, token);
        return true;
    } catch (error) {
        console.error('[Security] Failed to store token:', error);
        return false;
    }
};

/**
 * Securely retrieve token from localStorage with validation
 * @param {string} key - Storage key
 * @returns {string|null} - Valid token or null
 */
export const secureRetrieve = (key) => {
    try {
        const token = localStorage.getItem(key);
        if (!token) return null;
        
        if (!isValidTokenFormat(token)) {
            console.warn('[Security] Retrieved invalid token format, clearing');
            localStorage.removeItem(key);
            return null;
        }
        
        if (isTokenExpired(token)) {
            console.warn('[Security] Retrieved expired token, clearing');
            localStorage.removeItem(key);
            return null;
        }
        
        return token;
    } catch (error) {
        console.error('[Security] Failed to retrieve token:', error);
        return null;
    }
};

/**
 * Clear all authentication tokens
 */
export const clearAuthTokens = () => {
    try {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
    } catch (error) {
        console.error('[Security] Failed to clear tokens:', error);
    }
};

/**
 * Create a simple rate limiter for client-side
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} - Rate limiter object
 */
export const createRateLimiter = (maxAttempts, windowMs) => {
    let attempts = [];
    
    return {
        /**
         * Check if an attempt is allowed
         * @returns {boolean} - Whether the attempt is allowed
         */
        checkLimit: () => {
            const now = Date.now();
            // Remove expired attempts
            attempts = attempts.filter(time => now - time < windowMs);
            
            if (attempts.length >= maxAttempts) {
                return false;
            }
            
            attempts.push(now);
            return true;
        },
        
        /**
         * Get remaining time until reset
         * @returns {number} - Milliseconds until reset
         */
        getRemainingTime: () => {
            if (attempts.length === 0) return 0;
            const oldestAttempt = Math.min(...attempts);
            return Math.max(0, windowMs - (Date.now() - oldestAttempt));
        },
        
        /**
         * Reset the rate limiter
         */
        reset: () => {
            attempts = [];
        }
    };
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {object} - Validation result
 */
export const validatePhone = (phone) => {
    if (!phone) {
        return { isValid: true, message: '' }; // Phone is optional
    }
    
    // Remove spaces, dashes, and parentheses for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if it's a valid phone number (10-15 digits, optionally starting with +)
    const phoneRegex = /^\+?\d{10,15}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
        return { isValid: false, message: 'Please enter a valid phone number' };
    }
    
    return { isValid: true, message: '' };
};

/**
 * Validate date of birth
 * @param {string} dob - Date of birth to validate
 * @returns {object} - Validation result
 */
export const validateDob = (dob) => {
    if (!dob) {
        return { isValid: true, message: '' }; // DOB might be optional
    }
    
    const date = new Date(dob);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
        return { isValid: false, message: 'Please enter a valid date' };
    }
    
    if (date > now) {
        return { isValid: false, message: 'Date of birth cannot be in the future' };
    }
    
    // Check if age is reasonable (0-120 years)
    const age = (now - date) / (365.25 * 24 * 60 * 60 * 1000);
    if (age > 120) {
        return { isValid: false, message: 'Please enter a valid date of birth' };
    }
    
    return { isValid: true, message: '' };
};
