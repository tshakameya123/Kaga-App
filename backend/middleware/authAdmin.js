import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Admin Authentication Middleware
 * 
 * OWASP Addressed:
 * - A01:2021 - Broken Access Control
 * - A07:2021 - Identification and Authentication Failures
 */
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers;
        
        // Check if token exists
        if (!atoken) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin authentication required' 
            });
        }
        
        // Verify token format
        if (typeof atoken !== 'string') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token format' 
            });
        }
        
        // Verify and decode token
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
        });
        
        // Create expected token payload using timing-safe comparison
        const expectedPayload = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;
        const decodedStr = String(decoded);
        
        // Use timing-safe comparison to prevent timing attacks
        const isValid = crypto.timingSafeEqual(
            Buffer.from(decodedStr),
            Buffer.from(expectedPayload)
        );
        
        if (!isValid) {
            console.warn('[SECURITY] Invalid admin token attempt');
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized. Admin access required.' 
            });
        }
        
        // Mark request as admin authenticated
        req.isAdmin = true;
        
        next();
    } catch (error) {
        console.error('[ADMIN AUTH ERROR]', error.name, error.message);
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid admin token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin session expired. Please login again.' 
            });
        }
        
        // Handle timing-safe comparison errors
        if (error.code === 'ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized. Admin access required.' 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: 'Admin authentication failed' 
        });
    }
};

export default authAdmin;