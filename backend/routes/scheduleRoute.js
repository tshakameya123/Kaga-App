import express from 'express';
import {
    getDoctorSchedule,
    updateWeeklySchedule,
    updateDaySchedule,
    updateSlotDuration,
    blockTimeSlot,
    unblockTimeSlot,
    getBlockedTimes,
    getAvailableSlots,
    getAvailableSlotsBySpeciality,
    updateMaxPatients
} from '../controllers/scheduleController.js';
import authDoctor from '../middleware/authDoctor.js';

const scheduleRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Schedule
 *   description: Doctor schedule management
 */

/**
 * @swagger
 * /schedule/get:
 *   post:
 *     summary: Get doctor's schedule
 *     tags: [Schedule]
 *     security:
 *       - doctorAuth: []
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 */
scheduleRouter.post('/get', authDoctor, getDoctorSchedule);

/**
 * @swagger
 * /schedule/update-weekly:
 *   post:
 *     summary: Update weekly schedule
 *     tags: [Schedule]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weeklySchedule:
 *                 type: object
 *                 description: Weekly schedule by day
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 */
scheduleRouter.post('/update-weekly', authDoctor, updateWeeklySchedule);

/**
 * @swagger
 * /schedule/update-day:
 *   post:
 *     summary: Update a specific day's schedule
 *     tags: [Schedule]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               daySchedule:
 *                 type: object
 *                 properties:
 *                   isAvailable:
 *                     type: boolean
 *                   morning:
 *                     type: object
 *                   afternoon:
 *                     type: object
 *                   evening:
 *                     type: object
 *     responses:
 *       200:
 *         description: Day schedule updated successfully
 */
scheduleRouter.post('/update-day', authDoctor, updateDaySchedule);

/**
 * @swagger
 * /schedule/slot-duration:
 *   post:
 *     summary: Update appointment slot duration
 *     tags: [Schedule]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slotDuration:
 *                 type: number
 *                 description: Duration in minutes (10-120)
 *     responses:
 *       200:
 *         description: Slot duration updated
 */
scheduleRouter.post('/slot-duration', authDoctor, updateSlotDuration);

/**
 * @swagger
 * /schedule/block-time:
 *   post:
 *     summary: Block a time slot (vacation, meeting, etc.)
 *     tags: [Schedule]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date in DD_MM_YYYY format
 *               startTime:
 *                 type: string
 *                 description: Start time (HH:MM)
 *               endTime:
 *                 type: string
 *                 description: End time (HH:MM)
 *               reason:
 *                 type: string
 *                 description: Reason for blocking
 *     responses:
 *       200:
 *         description: Time slot blocked
 */
scheduleRouter.post('/block-time', authDoctor, blockTimeSlot);

/**
 * @swagger
 * /schedule/unblock-time:
 *   post:
 *     summary: Unblock a previously blocked time slot
 *     tags: [Schedule]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blockedTimeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Time slot unblocked
 */
scheduleRouter.post('/unblock-time', authDoctor, unblockTimeSlot);

/**
 * @swagger
 * /schedule/blocked-times:
 *   post:
 *     summary: Get blocked times for a date range
 *     tags: [Schedule]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blocked times retrieved
 */
scheduleRouter.post('/blocked-times', authDoctor, getBlockedTimes);

/**
 * @swagger
 * /schedule/available-slots:
 *   post:
 *     summary: Get available slots for a specific date
 *     tags: [Schedule]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - docId
 *               - date
 *             properties:
 *               docId:
 *                 type: string
 *               date:
 *                 type: string
 *                 description: Date in DD_MM_YYYY format
 *     responses:
 *       200:
 *         description: Available slots retrieved
 */
scheduleRouter.post('/available-slots', getAvailableSlots);

/**
 * @swagger
 * /schedule/available-slots-by-speciality:
 *   post:
 *     summary: Get available slots for all doctors in a speciality
 *     tags: [Schedule]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - speciality
 *               - date
 *             properties:
 *               speciality:
 *                 type: string
 *               date:
 *                 type: string
 *                 description: Date in DD_MM_YYYY format
 *     responses:
 *       200:
 *         description: Available slots for all doctors retrieved
 */
scheduleRouter.post('/available-slots-by-speciality', getAvailableSlotsBySpeciality);

/**
 * @swagger
 * /schedule/max-patients:
 *   post:
 *     summary: Update maximum patients per day
 *     tags: [Schedule]
 *     security:
 *       - doctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxPatientsPerDay:
 *                 type: number
 *     responses:
 *       200:
 *         description: Max patients updated
 */
scheduleRouter.post('/max-patients', authDoctor, updateMaxPatients);

export default scheduleRouter;
