import express from 'express';
import { loginDoctor, appointmentsDoctor, appointmentCancel, doctorList, changeAvailablity, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile } from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
const doctorRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Doctor management and operations
 */

/**
 * @swagger
 * /doctor/login:
 *   post:
 *     summary: Doctor login
 *     description: Authenticates a doctor and returns a JWT token.
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Doctor's email address
 *               password:
 *                 type: string
 *                 description: Doctor's password
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 */
doctorRouter.post("/login", loginDoctor)

/**
 * @swagger
 * /doctor/cancel-appointment:
 *   post:
 *     summary: Cancel an appointment
 *     description: Allows a doctor to cancel a patient's appointment.
 *     tags: [Doctor]
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
 *                 description: The ID of the appointment to cancel
 *     responses:
 *       200:
 *         description: Appointment canceled successfully
 *       400:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized access
 */
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)

/**
 * @swagger
 * /doctor/appointments:
 *   get:
 *     summary: Get doctor's appointments
 *     description: Retrieves a list of appointments specific to the logged-in doctor.
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *       401:
 *         description: Unauthorized access
 */
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)

/**
 * @swagger
 * /doctor/list:
 *   get:
 *     summary: List all doctors
 *     description: Retrieves a list of all doctors in the clinic.
 *     tags: [Doctor]
 *     responses:
 *       200:
 *         description: A list of doctors
 */
doctorRouter.get("/list", doctorList)

/**
 * @swagger
 * /doctor/change-availability:
 *   post:
 *     summary: Change availability
 *     description: Allows a doctor to change their availability status.
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               available:
 *                 type: boolean
 *                 description: New availability status
 *     responses:
 *       200:
 *         description: Availability updated
 *       401:
 *         description: Unauthorized access
 */
doctorRouter.post("/change-availability", authDoctor, changeAvailablity)

/**
 * @swagger
 * /doctor/complete-appointment:
 *   post:
 *     summary: Mark appointment as complete
 *     description: Allows a doctor to mark an appointment as completed.
 *     tags: [Doctor]
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
 *                 description: The ID of the appointment to mark as complete
 *     responses:
 *       200:
 *         description: Appointment marked as complete
 *       400:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized access
 */
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)

/**
 * @swagger
 * /doctor/dashboard:
 *   get:
 *     summary: Get doctor's dashboard data
 *     description: Retrieves summary data for the doctor's dashboard.
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)

/**
 * @swagger
 * /doctor/profile:
 *   get:
 *     summary: Get doctor profile
 *     description: Retrieves profile details of the logged-in doctor.
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile data
 *       401:
 *         description: Unauthorized access
 */
doctorRouter.get("/profile", authDoctor, doctorProfile)

/**
 * @swagger
 * /doctor/update-profile:
 *   post:
 *     summary: Update doctor profile
 *     description: Allows a doctor to update their profile information.
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the doctor
 *               specialty:
 *                 type: string
 *                 description: Updated specialty
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized access
 */
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile)                     

export default doctorRouter;