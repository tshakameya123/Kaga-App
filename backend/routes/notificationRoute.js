import express from 'express';
import { 
    createNotification, 
    getNotifications, 
    getDoctorNotifications,
    getAdminNotifications,
    getUnreadCount,
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    processAppointmentReminders
} from '../controllers/notificationController.js';
import authUser from '../middleware/authUser.js';
import authDoctor from '../middleware/authDoctor.js';
import authAdmin from '../middleware/authAdmin.js';

const notificationRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management for patients, doctors, and admins
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - recipientType
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Patient user ID (for patient notifications)
 *               doctorId:
 *                 type: string
 *                 description: Doctor ID (for doctor notifications)
 *               type:
 *                 type: string
 *                 enum: [appointment_confirmation, appointment_reminder, cancellation_alert, schedule_change, general]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               recipientType:
 *                 type: string
 *                 enum: [patient, doctor, admin]
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
notificationRouter.post('/', authAdmin, createNotification);

/**
 * @swagger
 * /notifications/patient/{userId}:
 *   get:
 *     summary: Get notifications for a patient
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
notificationRouter.get('/patient/:userId', authUser, getNotifications);

/**
 * @swagger
 * /notifications/doctor:
 *   post:
 *     summary: Get notifications for logged-in doctor
 *     tags: [Notifications]
 *     security:
 *       - doctorAuth: []
 *     responses:
 *       200:
 *         description: Doctor notifications retrieved
 */
notificationRouter.post('/doctor', authDoctor, getDoctorNotifications);

/**
 * @swagger
 * /notifications/admin:
 *   get:
 *     summary: Get notifications for admin
 *     tags: [Notifications]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Admin notifications retrieved
 */
notificationRouter.get('/admin', authAdmin, getAdminNotifications);

/**
 * @swagger
 * /notifications/unread-count:
 *   post:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Unread count retrieved
 */
notificationRouter.post('/unread-count', getUnreadCount);

/**
 * @swagger
 * /notifications/read/{id}:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
notificationRouter.patch('/read/:id', markAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
notificationRouter.post('/read-all', markAllAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 */
notificationRouter.delete('/:id', deleteNotification);

/**
 * @swagger
 * /notifications/process-reminders:
 *   post:
 *     summary: Process and send appointment reminders (cron job endpoint)
 *     tags: [Notifications]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Reminders processed
 */
notificationRouter.post('/process-reminders', authAdmin, processAppointmentReminders);

export default notificationRouter;
