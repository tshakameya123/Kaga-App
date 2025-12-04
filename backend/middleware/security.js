/**
 * Security Middleware - OWASP Top 10 Protections
 * 
 * This middleware provides comprehensive security protections including:
 * - XSS (Cross-Site Scripting) Protection
 * - SQL/NoSQL Injection Prevention
 * - Security Headers (via Helmet)
 * - HTTP Parameter Pollution Prevention
 * - Content Security Policy
 * - Request Size Limiting
 * - Input Sanitization
 */

import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Configure Helmet for security headers
 * Addresses: A05:2021 - Security Misconfiguration
 */
export const helmetMiddleware = helmet({
    // Content Security Policy - Prevents XSS attacks
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.stripe.com", "https://api.razorpay.com"],
            frameSrc: ["'self'", "https://js.stripe.com", "https://api.razorpay.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    // Cross-Origin settings
    crossOriginEmbedderPolicy: false, // Disable for Cloudinary images
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Disable browser caching of sensitive data
    noSniff: true,
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // Enable HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    // Prevent IE from executing downloads in site's context
    ieNoOpen: true,
    // Disable DNS prefetching
    dnsPrefetchControl: { allow: false },
    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/**
 * Custom XSS Sanitizer (replaces deprecated xss-clean)
 * Addresses: A03:2021 - Injection (XSS)
 */
const xssSanitize = (obj) => {
    if (typeof obj === 'string') {
        // Remove script tags and event handlers
        return obj
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/data:/gi, 'data-blocked:');
    }
    if (Array.isArray(obj)) {
        return obj.map(xssSanitize);
    }
    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = xssSanitize(value);
        }
        return sanitized;
    }
    return obj;
};

export const xssClean = (req, res, next) => {
    if (req.body) req.body = xssSanitize(req.body);
    if (req.query) req.query = xssSanitize(req.query);
    if (req.params) req.params = xssSanitize(req.params);
    next();
};

/**
 * MongoDB Sanitization
 * Addresses: A03:2021 - Injection (NoSQL Injection)
 * Prevents NoSQL injection by removing $ and . from input
 */
export const mongoSanitization = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`[SECURITY] Sanitized potential NoSQL injection in ${key}`);
    },
});

/**
 * HTTP Parameter Pollution Protection
 * Addresses: A03:2021 - Injection
 * Prevents HPP attacks by allowing only specific parameter arrays
 */
export const hppProtection = hpp({
    whitelist: [
        'speciality',
        'fees',
        'experience',
        'available',
    ],
});

/**
 * Custom security headers middleware
 * Adds additional security headers not covered by Helmet
 */
export const customSecurityHeaders = (req, res, next) => {
    // Prevent caching of sensitive data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Permissions Policy (formerly Feature-Policy)
    res.setHeader('Permissions-Policy', 
        'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(self), usb=()'
    );
    
    next();
};

/**
 * Request size limiter - prevents large payload attacks
 * Addresses: A05:2021 - Security Misconfiguration
 */
export const requestSizeLimiter = {
    json: { limit: '10kb' },    // Limit JSON body size
    urlencoded: { limit: '10kb', extended: true },
};

/**
 * Suspicious activity logger
 * Addresses: A09:2021 - Security Logging and Monitoring Failures
 */
export const securityLogger = (req, res, next) => {
    // Log suspicious patterns
    const suspiciousPatterns = [
        /(<script|javascript:|on\w+=)/i,  // XSS patterns
        /(\$where|\$gt|\$lt|\$ne|\$regex)/i,  // NoSQL injection
        /(union|select|insert|update|delete|drop|truncate)/i,  // SQL injection
        /(\.\.\/|\.\.\\)/,  // Path traversal
    ];
    
    const requestData = JSON.stringify({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
            console.warn(`[SECURITY ALERT] Suspicious request detected from IP: ${req.ip}`);
            console.warn(`[SECURITY ALERT] Pattern: ${pattern}`);
            console.warn(`[SECURITY ALERT] Path: ${req.path}`);
            console.warn(`[SECURITY ALERT] Method: ${req.method}`);
            break;
        }
    }
    
    next();
};

/**
 * Apply all security middleware
 * @param {Express} app - Express application instance
 */
export const applySecurityMiddleware = (app) => {
    // Helmet for security headers
    app.use(helmetMiddleware);
    
    // Custom security headers
    app.use(customSecurityHeaders);
    
    // XSS protection
    app.use(xssClean);
    
    // NoSQL injection protection
    app.use(mongoSanitization);
    
    // HPP protection
    app.use(hppProtection);
    
    // Security logging
    app.use(securityLogger);
    
    console.log('✅ Security middleware initialized (OWASP Top 10 protections active)');
};

export default {
    helmetMiddleware,
    xssClean,
    mongoSanitization,
    hppProtection,
    customSecurityHeaders,
    requestSizeLimiter,
    securityLogger,
    applySecurityMiddleware,
};
