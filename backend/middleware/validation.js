/**
 * Input Validation Middleware
 * 
 * Addresses OWASP Top 10:
 * - A03:2021 - Injection
 * - A04:2021 - Insecure Design
 * 
 * Provides centralized validation for all user inputs
 */

import validator from 'validator';
import mongoose from 'mongoose';

/**
 * Validation rules for different input types
 */
const validationRules = {
    email: (value) => {
        if (!value || typeof value !== 'string') return false;
        return validator.isEmail(value.trim());
    },
    
    password: (value) => {
        if (!value || typeof value !== 'string') return false;
        // Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(value);
    },
    
    name: (value) => {
        if (!value || typeof value !== 'string') return false;
        // Allow letters, spaces, hyphens, apostrophes (2-100 chars)
        const nameRegex = /^[a-zA-Z\s\-']{2,100}$/;
        return nameRegex.test(value.trim());
    },
    
    phone: (value) => {
        if (!value || typeof value !== 'string') return false;
        // Allow international phone formats
        return validator.isMobilePhone(value, 'any', { strictMode: false });
    },
    
    objectId: (value) => {
        if (!value || typeof value !== 'string') return false;
        return mongoose.Types.ObjectId.isValid(value);
    },
    
    date: (value) => {
        if (!value) return false;
        return validator.isDate(value.toString());
    },
    
    time: (value) => {
        if (!value || typeof value !== 'string') return false;
        // HH:MM AM/PM format
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
        return timeRegex.test(value.trim());
    },
    
    text: (value, maxLength = 1000) => {
        if (!value || typeof value !== 'string') return false;
        return value.length <= maxLength;
    },
    
    number: (value, min = 0, max = Infinity) => {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    },
    
    url: (value) => {
        if (!value || typeof value !== 'string') return false;
        return validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true });
    },
};

/**
 * Sanitize input to remove dangerous characters
 */
export const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;
    
    // Trim whitespace
    let sanitized = value.trim();
    
    // Escape HTML entities
    sanitized = validator.escape(sanitized);
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Remove potential NoSQL injection characters at start
    sanitized = sanitized.replace(/^\$/, '');
    
    return sanitized;
};

/**
 * Deep sanitize an object
 */
export const deepSanitize = (obj) => {
    if (typeof obj === 'string') {
        return sanitizeInput(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(deepSanitize);
    }
    
    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            // Sanitize both key and value
            const sanitizedKey = sanitizeInput(key);
            sanitized[sanitizedKey] = deepSanitize(value);
        }
        return sanitized;
    }
    
    return obj;
};

/**
 * Validation middleware factory
 * @param {Object} schema - Validation schema { field: 'validationType' }
 */
export const validateRequest = (schema) => {
    return (req, res, next) => {
        const errors = [];
        
        for (const [field, config] of Object.entries(schema)) {
            const value = req.body[field];
            const { type, required = true, message, options = {} } = 
                typeof config === 'string' ? { type: config } : config;
            
            // Check required fields
            if (required && (value === undefined || value === null || value === '')) {
                errors.push({ field, message: message || `${field} is required` });
                continue;
            }
            
            // Skip validation if field is optional and not provided
            if (!required && (value === undefined || value === null || value === '')) {
                continue;
            }
            
            // Validate based on type
            const validationFn = validationRules[type];
            if (validationFn && !validationFn(value, options.max, options.min)) {
                errors.push({ 
                    field, 
                    message: message || `${field} is invalid` 
                });
            }
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }
        
        next();
    };
};

/**
 * Pre-defined validation schemas
 */
export const validationSchemas = {
    register: {
        name: { type: 'name', message: 'Please enter a valid name (2-100 characters, letters only)' },
        email: { type: 'email', message: 'Please enter a valid email address' },
        password: { 
            type: 'password', 
            message: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
        },
    },
    
    login: {
        email: { type: 'email', message: 'Please enter a valid email address' },
        password: { type: 'text', message: 'Password is required' },
    },
    
    bookAppointment: {
        docId: { type: 'objectId', message: 'Invalid doctor ID' },
        slotDate: { type: 'text', message: 'Please select a valid date' },
        slotTime: { type: 'time', message: 'Please select a valid time slot' },
    },
    
    cancelAppointment: {
        appointmentId: { type: 'objectId', message: 'Invalid appointment ID' },
    },
    
    updateProfile: {
        name: { type: 'name', required: false, message: 'Please enter a valid name' },
        phone: { type: 'phone', required: false, message: 'Please enter a valid phone number' },
    },
    
    addDoctor: {
        name: { type: 'name', message: 'Please enter a valid doctor name' },
        email: { type: 'email', message: 'Please enter a valid email address' },
        password: { 
            type: 'password', 
            message: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
        },
        speciality: { type: 'text', message: 'Speciality is required' },
        degree: { type: 'text', message: 'Degree is required' },
        experience: { type: 'text', message: 'Experience is required' },
        about: { type: 'text', message: 'About section is required' },
        fees: { type: 'number', message: 'Please enter valid fees', options: { min: 0 } },
    },
};

/**
 * Middleware to sanitize all request data
 */
export const sanitizeRequest = (req, res, next) => {
    if (req.body) {
        req.body = deepSanitize(req.body);
    }
    if (req.query) {
        req.query = deepSanitize(req.query);
    }
    if (req.params) {
        req.params = deepSanitize(req.params);
    }
    next();
};

/**
 * Rate limit by user/IP for sensitive operations
 */
export const sensitiveOperationCheck = (req, res, next) => {
    // Add timestamp to track rapid successive requests
    const now = Date.now();
    const lastRequest = req.session?.lastSensitiveOperation || 0;
    
    if (now - lastRequest < 1000) { // 1 second minimum between sensitive ops
        return res.status(429).json({
            success: false,
            message: 'Please wait before performing this action again',
        });
    }
    
    if (req.session) {
        req.session.lastSensitiveOperation = now;
    }
    
    next();
};

export default {
    validateRequest,
    validationSchemas,
    sanitizeInput,
    deepSanitize,
    sanitizeRequest,
    sensitiveOperationCheck,
};
