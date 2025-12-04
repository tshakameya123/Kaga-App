import jwt from 'jsonwebtoken';

/**
 * User Authentication Middleware
 * 
 * OWASP Addressed:
 * - A01:2021 - Broken Access Control
 * - A07:2021 - Identification and Authentication Failures
 */
const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;
        
        // Check if token exists
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Please login.' 
            });
        }
        
        // Verify token format (basic check)
        if (typeof token !== 'string' || token.split('.').length !== 3) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token format' 
            });
        }
        
        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'], // Explicitly specify allowed algorithms
        });
        
        // Validate decoded payload
        if (!decoded || !decoded.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token payload' 
            });
        }
        
        // Check token expiration (if exp claim exists)
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token has expired. Please login again.' 
            });
        }
        
        // Attach user ID to request
        req.body.userId = decoded.id;
        req.userId = decoded.id; // Also attach to req for better access
        
        next();
    } catch (error) {
        console.error('[AUTH ERROR]', error.name, error.message);
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. Please login again.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token has expired. Please login again.' 
            });
        }
        
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token not yet valid' 
            });
        }
        
        // Generic error (don't expose internal details)
        return res.status(500).json({ 
            success: false, 
            message: 'Authentication failed. Please try again.' 
        });
    }
};

export default authUser;