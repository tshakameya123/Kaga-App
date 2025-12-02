import jwt from 'jsonwebtoken';

/**
 * Doctor Authentication Middleware
 * 
 * OWASP Addressed:
 * - A01:2021 - Broken Access Control
 * - A07:2021 - Identification and Authentication Failures
 */
const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers;
        
        // Check if token exists
        if (!dtoken) {
            return res.status(401).json({ 
                success: false, 
                message: 'Doctor authentication required. Please login.' 
            });
        }
        
        // Verify token format
        if (typeof dtoken !== 'string' || dtoken.split('.').length !== 3) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token format' 
            });
        }
        
        // Verify and decode token
        const decoded = jwt.verify(dtoken, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
        });
        
        // Validate decoded payload
        if (!decoded || !decoded.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token payload' 
            });
        }
        
        // Check token expiration
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ 
                success: false, 
                message: 'Session expired. Please login again.' 
            });
        }
        
        // Attach doctor ID to request
        req.body.docId = decoded.id;
        req.docId = decoded.id;
        req.isDoctor = true;
        
        next();
    } catch (error) {
        console.error('[DOCTOR AUTH ERROR]', error.name, error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid doctor token. Please login again.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Doctor session expired. Please login again.' 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: 'Doctor authentication failed' 
        });
    }
};

export default authDoctor;