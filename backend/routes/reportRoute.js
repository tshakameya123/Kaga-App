import express from 'express';
import {
    createVisitReport,
    updateVisitReport,
    getPatientHistory,
    getReportByAppointment,
    getDailySummary,
    getDoctorDailySummary,
    getAppointmentStats,
    getPatientStats,
    getDoctorStats,
    generateReport
} from '../controllers/reportController.js';
import authDoctor from '../middleware/authDoctor.js';
import authAdmin from '../middleware/authAdmin.js';

const reportRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Patient history, daily summaries, and analytics
 */

// ============================================
// PATIENT HISTORY (Doctor Access)
// ============================================

/**
 * @swagger
 * /reports/visit/create:
 *   post:
 *     summary: Create a visit report/notes for an appointment
 *     tags: [Reports]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *               chiefComplaint:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               treatment:
 *                 type: string
 *               prescription:
 *                 type: string
 *               notes:
 *                 type: string
 *               vitals:
 *                 type: object
 *                 properties:
 *                   bloodPressure:
 *                     type: string
 *                   heartRate:
 *                     type: number
 *                   temperature:
 *                     type: number
 *                   weight:
 *                     type: number
 *               followUpDate:
 *                 type: string
 *                 format: date
 *               followUpNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visit report created
 */
reportRouter.post('/visit/create', authDoctor, createVisitReport);

/**
 * @swagger
 * /reports/visit/update:
 *   post:
 *     summary: Update a visit report
 *     tags: [Reports]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportId
 *             properties:
 *               reportId:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               treatment:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated
 */
reportRouter.post('/visit/update', authDoctor, updateVisitReport);

/**
 * @swagger
 * /reports/patient-history:
 *   post:
 *     summary: Get patient's appointment history and visit notes
 *     tags: [Reports]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient history retrieved
 */
reportRouter.post('/patient-history', authDoctor, getPatientHistory);

/**
 * @swagger
 * /reports/visit/{appointmentId}:
 *   get:
 *     summary: Get report by appointment ID
 *     tags: [Reports]
 *     security:
 *       - doctorAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report retrieved
 */
reportRouter.get('/visit/:appointmentId', authDoctor, getReportByAppointment);

// ============================================
// DAILY SUMMARIES
// ============================================

/**
 * @swagger
 * /reports/daily-summary:
 *   post:
 *     summary: Get daily appointment summary for all doctors (Admin)
 *     tags: [Reports]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date in DD_MM_YYYY format (defaults to today)
 *     responses:
 *       200:
 *         description: Daily summary retrieved
 */
reportRouter.post('/daily-summary', authAdmin, getDailySummary);

/**
 * @swagger
 * /reports/doctor-daily-summary:
 *   post:
 *     summary: Get daily appointment summary for a specific doctor
 *     tags: [Reports]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date in DD_MM_YYYY format (defaults to today)
 *     responses:
 *       200:
 *         description: Doctor's daily summary retrieved
 */
reportRouter.post('/doctor-daily-summary', authDoctor, getDoctorDailySummary);

// ============================================
// ANALYTICS & STATISTICS (Admin Access)
// ============================================

/**
 * @swagger
 * /reports/stats/appointments:
 *   post:
 *     summary: Get appointment statistics
 *     tags: [Reports]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 description: Start date (DD_MM_YYYY)
 *               endDate:
 *                 type: string
 *                 description: End date (DD_MM_YYYY)
 *     responses:
 *       200:
 *         description: Appointment stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalAppointments:
 *                       type: number
 *                     completedAppointments:
 *                       type: number
 *                     noShowRate:
 *                       type: string
 *                     bySpeciality:
 *                       type: object
 */
reportRouter.post('/stats/appointments', authAdmin, getAppointmentStats);

/**
 * @swagger
 * /reports/stats/patients:
 *   post:
 *     summary: Get patient statistics
 *     tags: [Reports]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Patient stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalPatients:
 *                       type: number
 *                     frequentVisitors:
 *                       type: array
 *                     visitPatterns:
 *                       type: object
 */
reportRouter.post('/stats/patients', authAdmin, getPatientStats);

/**
 * @swagger
 * /reports/stats/doctor:
 *   post:
 *     summary: Get doctor performance statistics
 *     tags: [Reports]
 *     security:
 *       - doctorAuth: []
 *     responses:
 *       200:
 *         description: Doctor stats retrieved
 */
reportRouter.post('/stats/doctor', authDoctor, getDoctorStats);

/**
 * @swagger
 * /reports/generate:
 *   post:
 *     summary: Generate a comprehensive report
 *     tags: [Reports]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [appointments, patients, revenue, comprehensive]
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report generated
 */
reportRouter.post('/generate', authAdmin, generateReport);

export default reportRouter;
