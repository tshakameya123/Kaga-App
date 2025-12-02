import express from "express";
import cors from 'cors';
import 'dotenv/config';
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRouter from "./routes/notificationRoute.js";
import scheduleRouter from "./routes/scheduleRoute.js";
import reportRouter from "./routes/reportRoute.js";
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { rescheduleAppointment } from './controllers/userController.js';
import weatherRoutes from './routes/weather.js';

// Security middleware imports
import { applySecurityMiddleware, requestSizeLimiter } from './middleware/security.js';
import { sanitizeRequest } from './middleware/validation.js';

// Rate limiting
import rateLimit from "express-rate-limit";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Initialize database connection before starting server
const startServer = async () => {
  try {
    await connectDB();
    connectCloudinary();
    
    // Start server only after database connection is established
    app.listen(port, () => {
      console.log(`🚀 Server started on PORT: ${port}`);
      console.log(`📡 API available at http://localhost:${port}/api`);
      console.log(`📚 API Docs at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// ============================================
// SECURITY MIDDLEWARE (OWASP Top 10)
// ============================================

// Apply comprehensive security middleware (Helmet, XSS, NoSQL injection, HPP)
applySecurityMiddleware(app);

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { 
    success: false, 
    message: "Too many requests from this IP, please try again after 15 minutes." 
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health' || req.path === '/',
});

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes
  message: { 
    success: false, 
    message: "Too many login attempts. Please try again after 15 minutes." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// API DOCUMENTATION
// ============================================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kaga Health API",
      version: "1.0.0",
      description: "API documentation for Health Clinic Appointment System",
      contact: {
        name: "Support Team",
        email: "kagahealthsupport@gmail.com"
      },
    },
    servers: [
      { 
        url: `https://kh-backend.onrender.com/api`,
        description: 'Production server'
      },
      { 
        url: `http://localhost:${port}/api`,
        description: 'Local development server'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'token',
          description: 'JWT Token for user authentication',
        },
        adminAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'atoken',
          description: 'JWT Token for admin authentication',
        },
        doctorAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'dtoken',
          description: 'JWT Token for doctor authentication',
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Kaga Health API Documentation",
}));

// ============================================
// MIDDLEWARE STACK
// ============================================

// Parse JSON with size limit (prevents large payload attacks)
app.use(express.json(requestSizeLimiter.json));
app.use(express.urlencoded(requestSizeLimiter.urlencoded));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.ADMIN_URL, 'https://kagahealth.onrender.com', 'https://kh-admin.onrender.com'].filter(Boolean)
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'atoken', 'dtoken', 'origin'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Apply global rate limiting
app.use(globalLimiter);

// sanitize request data to prevent XSS and NoSQL injection
app.use(
  mongoSanitize({
    replaceWith: '_', // avoids setting read-only req.query
  })
);

// Sanitize all incoming requests
app.use(sanitizeRequest);

// ============================================
// API ROUTES
// ============================================

// Apply strict rate limiting to auth routes
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/admin/login", authLimiter);
app.use("/api/doctor/login", authLimiter);

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api", messageRoutes);
app.use("/api/notifications", notificationRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/reports", reportRouter);
app.post('/api/user/reschedule-appointment', rescheduleAppointment);
app.use('/api', weatherRoutes);

// ============================================
// HEALTH CHECK & ERROR HANDLING
// ============================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Kaga Health API - Running",
    version: "1.0.0",
    docs: `/api-docs`,
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});
