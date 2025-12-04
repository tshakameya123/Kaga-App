# 🔒 OWASP Top 10 Security Implementation Guide

## Kaga Health Full-Stack Security Documentation

This document outlines the security measures implemented across the **entire Kaga Health application stack** (Backend, Admin Panel, and Patient Portal) to address the **OWASP Top 10 (2021)** vulnerabilities.

---

## 🛡️ Security Coverage Overview

| Component | Security Status | Key Protections |
|-----------|-----------------|-----------------|
| **Backend API** | ✅ Fully Protected | Helmet, Rate Limiting, Input Validation, JWT Auth |
| **Admin Panel** | ✅ Fully Protected | Token Validation, XSS Prevention, Rate Limiting |
| **Patient Portal** | ✅ Fully Protected | Secure Auth, Input Sanitization, Token Expiry Checks |

---

## 📋 Table of Contents

1. [A01:2021 - Broken Access Control](#a012021---broken-access-control)
2. [A02:2021 - Cryptographic Failures](#a022021---cryptographic-failures)
3. [A03:2021 - Injection](#a032021---injection)
4. [A04:2021 - Insecure Design](#a042021---insecure-design)
5. [A05:2021 - Security Misconfiguration](#a052021---security-misconfiguration)
6. [A06:2021 - Vulnerable Components](#a062021---vulnerable-components)
7. [A07:2021 - Identification and Authentication Failures](#a072021---identification-and-authentication-failures)
8. [A08:2021 - Software and Data Integrity Failures](#a082021---software-and-data-integrity-failures)
9. [A09:2021 - Security Logging and Monitoring Failures](#a092021---security-logging-and-monitoring-failures)
10. [A10:2021 - Server-Side Request Forgery (SSRF)](#a102021---server-side-request-forgery-ssrf)

---

## A01:2021 - Broken Access Control

### ✅ Implemented Protections

**Location:** `middleware/authUser.js`, `middleware/authAdmin.js`, `middleware/authDoctor.js`

| Protection | Implementation |
|------------|----------------|
| JWT-based Authentication | All protected routes require valid JWT tokens |
| Role-based Access Control | Separate middleware for users, doctors, and admins |
| Token Expiration | JWTs expire after 7 days |
| Resource Ownership Validation | Users can only access/modify their own data |

**Code Example:**
```javascript
// Verify user owns the resource before modification
if (appointmentData.userId !== userId) {
    return res.status(403).json({ success: false, message: 'Unauthorized action' });
}
```

### 🔧 Files Modified
- `middleware/authUser.js` - User authentication
- `middleware/authAdmin.js` - Admin authentication with timing-safe comparison
- `middleware/authDoctor.js` - Doctor authentication
- `controllers/userController.js` - Resource ownership checks

---

## A02:2021 - Cryptographic Failures

### ✅ Implemented Protections

**Location:** `controllers/userController.js`, `controllers/adminController.js`

| Protection | Implementation |
|------------|----------------|
| Password Hashing | bcrypt with cost factor 12 |
| Secure Token Generation | HS256 algorithm with secret key |
| HTTPS Enforcement | HSTS headers enabled |
| Sensitive Data Protection | Passwords excluded from API responses |

**Code Example:**
```javascript
// Strong password hashing
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(password, salt);

// Exclude password from responses
const userData = await userModel.findById(userId).select('-password');
```

### 🔐 Environment Variables Required
```env
JWT_SECRET=your_very_long_and_random_secret_key_min_32_chars
```

---

## A03:2021 - Injection

### ✅ Implemented Protections

**Location:** `middleware/security.js`, `middleware/validation.js`

| Protection | Implementation |
|------------|----------------|
| NoSQL Injection Prevention | express-mongo-sanitize |
| XSS Prevention | xss-clean middleware |
| Input Sanitization | Custom sanitization for all inputs |
| Parameterized Queries | Mongoose ORM with schema validation |

**Code Example:**
```javascript
// NoSQL injection protection
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized potential injection in ${key}`);
    },
}));

// Input sanitization
export const sanitizeInput = (value) => {
    let sanitized = value.trim();
    sanitized = validator.escape(sanitized);
    sanitized = sanitized.replace(/\0/g, '');
    sanitized = sanitized.replace(/^\$/, '');
    return sanitized;
};
```

---

## A04:2021 - Insecure Design

### ✅ Implemented Protections

**Location:** `middleware/validation.js`, `controllers/`

| Protection | Implementation |
|------------|----------------|
| Input Validation | Centralized validation schemas |
| Business Logic Protection | Validation before operations |
| Rate Limiting | Prevent brute-force attacks |
| Error Handling | Don't expose internal details |

**Validation Schemas:**
```javascript
export const validationSchemas = {
    register: {
        name: { type: 'name', message: 'Valid name required' },
        email: { type: 'email', message: 'Valid email required' },
        password: { type: 'password', message: 'Strong password required' },
    },
    bookAppointment: {
        docId: { type: 'objectId', message: 'Invalid doctor ID' },
        slotDate: { type: 'text', message: 'Valid date required' },
        slotTime: { type: 'time', message: 'Valid time required' },
    },
};
```

---

## A05:2021 - Security Misconfiguration

### ✅ Implemented Protections

**Location:** `middleware/security.js`, `server.js`

| Protection | Implementation |
|------------|----------------|
| Security Headers | Helmet.js middleware |
| CORS Configuration | Restricted origins in production |
| Request Size Limits | 10KB max for JSON/URL-encoded |
| Error Messages | Generic messages in production |

**Security Headers Configured:**
```javascript
// Helmet configuration
app.use(helmet({
    contentSecurityPolicy: { ... },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    frameguard: { action: 'deny' },
    noSniff: true,
    hidePoweredBy: true,
}));
```

**Headers Added:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: ...`
- `Permissions-Policy: ...`

---

## A06:2021 - Vulnerable Components

### ✅ Implemented Protections

| Protection | Implementation |
|------------|----------------|
| Dependency Auditing | Regular `npm audit` |
| Version Pinning | Specific versions in package.json |
| Security Patches | Keep dependencies updated |

**Recommended Commands:**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

---

## A07:2021 - Identification and Authentication Failures

### ✅ Implemented Protections

**Location:** `middleware/auth*.js`, `controllers/userController.js`

| Protection | Implementation |
|------------|----------------|
| Strong Password Policy | Min 8 chars, uppercase, lowercase, number |
| Rate Limiting on Auth | 5 attempts per 15 minutes |
| Secure Token Storage | JWT with expiration |
| Generic Error Messages | Prevent user enumeration |

**Password Policy:**
```javascript
const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&#^()_+=\-[\]{}|;:'",.<>/\\`~]{8,}$/;
    return regex.test(password);
};
```

**Rate Limiting:**
```javascript
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { success: false, message: "Too many login attempts" },
});
```

---

## A08:2021 - Software and Data Integrity Failures

### ✅ Implemented Protections

| Protection | Implementation |
|------------|----------------|
| JWT Verification | Algorithm explicitly specified |
| Input Validation | All user inputs validated |
| Secure Updates | Code review before deployment |

**JWT Configuration:**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'], // Explicitly specify algorithm
});
```

---

## A09:2021 - Security Logging and Monitoring Failures

### ✅ Implemented Protections

**Location:** `middleware/security.js`, `server.js`

| Protection | Implementation |
|------------|----------------|
| Security Event Logging | Suspicious activity logged |
| Error Logging | All errors logged with context |
| Request Monitoring | Rate limit tracking |

**Security Logger:**
```javascript
export const securityLogger = (req, res, next) => {
    const suspiciousPatterns = [
        /(<script|javascript:|on\w+=)/i,  // XSS
        /(\$where|\$gt|\$lt|\$ne)/i,       // NoSQL injection
        /(union|select|insert|update|delete|drop)/i, // SQL injection
    ];
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
            console.warn(`[SECURITY ALERT] Suspicious request from IP: ${req.ip}`);
        }
    }
    next();
};
```

---

## A10:2021 - Server-Side Request Forgery (SSRF)

### ✅ Implemented Protections

| Protection | Implementation |
|------------|----------------|
| URL Validation | Validate external URLs |
| Whitelist External Services | Only allow specific external APIs |
| Network Segmentation | Cloudinary, Stripe, Razorpay whitelisted |

---

## 📁 Security Files Structure

```
kh-app/
├── backend/
│   ├── middleware/
│   │   ├── authAdmin.js      # Admin authentication
│   │   ├── authDoctor.js     # Doctor authentication
│   │   ├── authUser.js       # User authentication
│   │   ├── security.js       # Security middleware (NEW)
│   │   ├── validation.js     # Input validation (NEW)
│   │   └── multer.js         # File upload security
│   ├── controllers/
│   │   ├── userController.js     # Enhanced with security
│   │   ├── doctorController.js   # Enhanced with security
│   │   └── adminController.js    # Enhanced with security
│   ├── server.js                 # Security middleware integration
│   └── SECURITY.md               # This file
│
├── admin-doc/
│   └── src/
│       ├── utils/
│       │   ├── security.js       # Client-side security utilities (NEW)
│       │   └── api.js            # Axios with interceptors (NEW)
│       ├── context/
│       │   ├── AdminContext.jsx  # Enhanced with security (UPDATED)
│       │   └── DoctorContext.jsx # Enhanced with security (UPDATED)
│       └── pages/
│           └── login.jsx         # Enhanced with security (UPDATED)
│
└── frontend/
    └── src/
        ├── utils/
        │   └── security.js       # Client-side security utilities (NEW)
        ├── context/
        │   └── AppContext.jsx    # Enhanced with security (UPDATED)
        └── pages/
            └── Login.jsx         # Enhanced with security (UPDATED)
```

---

## 🌐 Frontend Security Measures

### Admin Panel (`admin-doc`)

**Security Utilities:** `src/utils/security.js`
- `sanitizeInput()` - XSS prevention
- `isValidEmail()` - Email format validation
- `validatePassword()` - Strong password enforcement
- `isTokenExpired()` - JWT expiration checking
- `secureRetrieve()` - Safe token retrieval with validation
- `clearAuthTokens()` - Secure logout
- `createRateLimiter()` - Client-side rate limiting

**Context Enhancements:**
```javascript
// Periodic token validity check
useEffect(() => {
    const checkTokenValidity = () => {
        const token = localStorage.getItem('aToken');
        if (token && isTokenExpired(token)) {
            handleLogout();
        }
    };
    const interval = setInterval(checkTokenValidity, 60000);
    return () => clearInterval(interval);
}, []);

// Centralized error handling
const handleApiError = useCallback((error, action) => {
    if (status === 401 || status === 403 || status === 429) {
        // Handle auth/rate limit errors
    }
}, []);
```

### Patient Portal (`frontend`)

**Security Utilities:** `src/utils/security.js`
- All utilities from admin-doc plus:
- `validateName()` - Name input validation
- `validatePhone()` - Phone number validation
- `validateDob()` - Date of birth validation

**Login Enhancements:**
- Client-side rate limiting (5 attempts/15 minutes)
- Password visibility toggle
- Real-time input validation
- Strong password requirements display
- Error state management

---

## 🚀 Quick Security Checklist

### Before Deployment

- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` and `ADMIN_URL` for CORS
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Enable HTTPS in production
- [ ] Review and update `.env` file
- [ ] Remove any debug/test credentials

### Environment Variables

```env
# Required for security
JWT_SECRET=your_very_long_random_secret_key_minimum_32_characters
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
ADMIN_URL=https://your-admin.com

# Sensitive credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=VeryStrongAdminPassword123!
```

---

## 🔧 Installing Security Dependencies

```bash
cd backend
npm install helmet xss-clean hpp express-mongo-sanitize
```

---

## 📊 Security Testing

### Manual Testing
1. Test rate limiting by making 6+ rapid login attempts
2. Test XSS by submitting `<script>alert('xss')</script>` in forms
3. Test NoSQL injection with `{"$gt": ""}` in fields
4. Verify security headers using browser DevTools

### Automated Testing
```bash
# Run security tests
npm test

# Check for vulnerabilities
npm audit
```

---

## 📝 Security Incident Response

If a security incident occurs:

1. **Identify** - Determine the scope and nature of the incident
2. **Contain** - Isolate affected systems if necessary
3. **Investigate** - Review logs in `middleware/security.js` logging
4. **Remediate** - Apply fixes and patches
5. **Document** - Record the incident and response
6. **Notify** - Inform affected users if data was compromised

---

## 📚 References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

<p align="center">
  <strong>🔒 Security is everyone's responsibility</strong>
</p>
