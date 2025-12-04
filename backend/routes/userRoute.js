import express from 'express';
import rateLimit from 'express-rate-limit'; 
import {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  paymentStripe,
  verifyStripe,
  rescheduleAppointment,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  changePassword,
  deleteAccount
} from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

// Defined the rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
});

// Stricter rate limiter for password reset to prevent abuse
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 password reset requests per hour
  message: 'Too many password reset requests. Please try again later.',
});

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Patient/User management and authentication
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
userRouter.post("/register", limiter, registerUser);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/login", limiter, loginUser);

/**
 * @swagger
 * /user/get-profile:
 *   get:
 *     summary: Retrieve user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/get-profile", authUser, getProfile);

/**
 * @swagger
 * /user/update-profile:
 *   post:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 */
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile);

/**
 * @swagger
 * /user/book-appointment:
 *   post:
 *     summary: Book an appointment
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Bad request
 */
userRouter.post("/book-appointment", authUser, bookAppointment);

/**
 * @swagger
 * /user/appointments:
 *   get:
 *     summary: List user appointments
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/appointments", authUser, listAppointment);

/**
 * @swagger
 * /user/cancel-appointment:
 *   post:
 *     summary: Cancel an appointment
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       404:
 *         description: Appointment not found
 */
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

/**
 * @swagger
 * /user/payment-razorpay:
 *   post:
 *     summary: Initiate a payment with Razorpay
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Razorpay payment initiated
 *       400:
 *         description: Bad request
 */
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);

/**
 * @swagger
 * /user/verifyRazorpay:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Razorpay payment verified
 *       400:
 *         description: Verification failed
 */
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

/**
 * @swagger
 * /user/payment-stripe:
 *   post:
 *     summary: Initiate a payment with Stripe
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stripe payment initiated
 *       400:
 *         description: Bad request
 */
userRouter.post("/payment-stripe", authUser, paymentStripe);

/**
 * @swagger
 * /user/verifyStripe:
 *   post:
 *     summary: Verify Stripe payment
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stripe payment verified
 *       400:
 *         description: Verification failed
 */
userRouter.post("/verifyStripe", authUser, verifyStripe);

/**
 * @swagger
 * /user/reschedule-appointment:
 *   post:
 *     summary: Reschedule an appointment
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - newDate
 *               - newTime
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: The ID of the appointment to reschedule
 *               newDate:
 *                 type: string
 *                 format: date
 *                 description: The new date for the appointment
 *               newTime:
 *                 type: string
 *                 description: The new time slot for the appointment
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *       400:
 *         description: Invalid data or slot not available
 *       404:
 *         description: Appointment not found
 */
userRouter.post('/reschedule-appointment', rescheduleAppointment);

// ============================================
// PASSWORD RECOVERY & ACCOUNT MANAGEMENT ROUTES
// ============================================

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset link sent (if email exists)
 *       400:
 *         description: Invalid email
 */
userRouter.post('/forgot-password', passwordResetLimiter, forgotPassword);

/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               newPassword:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
userRouter.post('/reset-password', passwordResetLimiter, resetPassword);

/**
 * @swagger
 * /user/verify-reset-token/{token}:
 *   get:
 *     summary: Verify if password reset token is valid
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Token is invalid or expired
 */
userRouter.get('/verify-reset-token/:token', verifyResetToken);

/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Change password for logged in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 */
userRouter.post('/change-password', authUser, changePassword);

/**
 * @swagger
 * /user/delete-account:
 *   post:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: User's password for confirmation
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Password is incorrect
 */
userRouter.post('/delete-account', authUser, deleteAccount);


export default userRouter;
