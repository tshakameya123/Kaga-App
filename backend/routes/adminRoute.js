import express from 'express';
import { loginAdmin, appointmentsAdmin, appointmentCancel, deleteAppointment, addDoctor, allDoctors, allPatients, deletePatient, deleteDoctor, editDoctor, adminDashboard } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and operations
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticates an admin and returns a JWT token.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Admin's email address
 *                 example: "admin@clinic.com"
 *               password:
 *                 type: string
 *                 description: Admin's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for the admin
 *       400:
 *         description: Invalid credentials provided
 */
adminRouter.post("/login", loginAdmin)
/**
 * @swagger
 * /admin/add-doctor:
 *   post:
 *     summary: Add a new doctor
 *     description: Allows an admin to add a new doctor, including uploading an image.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Doctor's name
 *               email:
 *                 type: string
 *                 description: Doctor's email address
 *               specialty:
 *                 type: string
 *                 description: Doctor's specialty
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Doctor's profile picture
 *     responses:
 *       201:
 *         description: Doctor added successfully
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized access
 */
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
/**
 * @swagger
 * /admin/appointments:
 *   get:
 *     summary: Get all appointments
 *     description: Retrieves a list of all clinic appointments for admin view.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: A list of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   date:
 *                     type: string
 *                   patientName:
 *                     type: string
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized access
 */
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
/**
 * @swagger
 * /admin/cancel-appointment:
 *   post:
 *     summary: Cancel an appointment
 *     description: Allows an admin to cancel a patient's appointment.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: The ID of the appointment to be canceled
 *     responses:
 *       200:
 *         description: Appointment canceled successfully
 *       400:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized access
 */
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
/**
 * @swagger
 * /admin/delete-appointment:
 *   post:
 *     summary: Delete an appointment permanently
 *     description: Allows an admin to permanently delete a patient's appointment from the database.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: The ID of the appointment to be deleted
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       400:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized access
 */
adminRouter.post("/delete-appointment", authAdmin, deleteAppointment)
/**
 * @swagger
 * /admin/all-doctors:
 *   get:
 *     summary: Get all doctors
 *     description: Retrieves a list of all doctors in the clinic.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: A list of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   specialty:
 *                     type: string
 *                   availability:
 *                     type: boolean
 *       401:
 *         description: Unauthorized access
 */
adminRouter.get("/all-doctors", authAdmin, allDoctors)

/**
 * @swagger
 * /admin/all-patients:
 *   get:
 *     summary: Get all patients
 *     description: Retrieves a list of all registered patients.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: A list of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 patients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *       401:
 *         description: Unauthorized access
 */
adminRouter.get("/all-patients", authAdmin, allPatients)

/**
 * @swagger
 * /admin/delete-patient:
 *   post:
 *     summary: Delete a patient
 *     description: Allows an admin to permanently delete a patient from the system.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: The ID of the patient to be deleted
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       400:
 *         description: Patient not found
 *       401:
 *         description: Unauthorized access
 */
adminRouter.post("/delete-patient", authAdmin, deletePatient)
/**
 * @swagger
 * /admin/delete-doctor:
 *   post:
 *     summary: Delete a doctor
 *     description: Allows an admin to permanently delete a doctor and their appointments.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               docId:
 *                 type: string
 *                 description: The ID of the doctor to be deleted
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       400:
 *         description: Doctor not found
 *       401:
 *         description: Unauthorized access
 */
adminRouter.post("/delete-doctor", authAdmin, deleteDoctor)
/**
 * @swagger
 * /admin/edit-doctor:
 *   post:
 *     summary: Edit a doctor
 *     description: Allows an admin to update doctor information.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               docId:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               speciality:
 *                 type: string
 *               degree:
 *                 type: string
 *               experience:
 *                 type: string
 *               about:
 *                 type: string
 *               fees:
 *                 type: number
 *               address:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       400:
 *         description: Doctor not found
 *       401:
 *         description: Unauthorized access
 */
adminRouter.post("/edit-doctor", authAdmin, upload.single('image'), editDoctor)
/**
 * @swagger
 * /admin/change-availability:
 *   post:
 *     summary: Change doctor availability
 *     description: Allows an admin to change the availability of a doctor.
 *     tags:
 *       - Admin
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *                 description: The ID of the doctor whose availability is to be changed
 *               available:
 *                 type: boolean
 *                 description: The new availability status of the doctor
 *     responses:
 *       200:
 *         description: Availability status updated successfully.
 *       401:
 *         description: Unauthorized access.
 */

adminRouter.post("/change-availability", authAdmin, changeAvailablity)
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     description: Retrieves summary data for the admin dashboard, such as total appointments, total doctors, etc.
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAppointments:
 *                   type: integer
 *                 totalDoctors:
 *                   type: integer
 *                 activePatients:
 *                   type: integer
 *       401:
 *         description: Unauthorized access
 */
adminRouter.get("/dashboard", authAdmin, adminDashboard)

export default adminRouter;
