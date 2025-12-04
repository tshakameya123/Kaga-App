import Notification from '../models/notificationModel.js';
import appointmentModel from '../models/AppointmentModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';

// ============================================
// NOTIFICATION CREATION HELPERS
// ============================================

// Send appointment confirmation to patient
export const sendAppointmentConfirmation = async (appointmentData) => {
    try {
        const notification = new Notification({
            userId: appointmentData.userId,
            appointmentId: appointmentData._id,
            type: 'appointment_confirmation',
            title: 'Appointment Confirmed',
            message: `Your appointment with Dr. ${appointmentData.docData.name} has been confirmed for ${appointmentData.slotDate} at ${appointmentData.slotTime}.`,
            recipientType: 'patient',
            sentAt: new Date()
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error sending appointment confirmation:', error);
        throw error;
    }
};

// Send reminder to patient (24 hours before appointment)
export const sendAppointmentReminder = async (appointmentData) => {
    try {
        const notification = new Notification({
            userId: appointmentData.userId,
            appointmentId: appointmentData._id,
            type: 'appointment_reminder',
            title: 'Appointment Reminder',
            message: `Reminder: You have an appointment with Dr. ${appointmentData.docData.name} tomorrow at ${appointmentData.slotTime}. Please arrive 15 minutes early.`,
            recipientType: 'patient',
            sentAt: new Date()
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error sending appointment reminder:', error);
        throw error;
    }
};

// Send cancellation alert to doctor and admin
export const sendCancellationAlert = async (appointmentData, cancelledBy = 'patient') => {
    try {
        const notifications = [];
        
        // Notify doctor
        const doctorNotification = new Notification({
            doctorId: appointmentData.docId,
            appointmentId: appointmentData._id,
            type: 'cancellation_alert',
            title: 'Appointment Cancelled',
            message: `Appointment with patient ${appointmentData.userData.name} on ${appointmentData.slotDate} at ${appointmentData.slotTime} has been cancelled by ${cancelledBy}.`,
            recipientType: 'doctor',
            sentAt: new Date()
        });
        await doctorNotification.save();
        notifications.push(doctorNotification);

        // Notify admin
        const adminNotification = new Notification({
            type: 'cancellation_alert',
            title: 'Appointment Cancelled',
            message: `Appointment between Dr. ${appointmentData.docData.name} and patient ${appointmentData.userData.name} on ${appointmentData.slotDate} at ${appointmentData.slotTime} has been cancelled.`,
            recipientType: 'admin',
            sentAt: new Date()
        });
        await adminNotification.save();
        notifications.push(adminNotification);

        return notifications;
    } catch (error) {
        console.error('Error sending cancellation alert:', error);
        throw error;
    }
};

// Send schedule change notification
export const sendScheduleChangeAlert = async (doctorId, changeDetails) => {
    try {
        const doctor = await doctorModel.findById(doctorId);
        const notification = new Notification({
            doctorId: doctorId,
            type: 'schedule_change',
            title: 'Schedule Updated',
            message: changeDetails,
            recipientType: 'admin',
            sentAt: new Date()
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error sending schedule change alert:', error);
        throw error;
    }
};

// ============================================
// NEW: NOTIFY DOCTOR WHEN PATIENT BOOKS
// ============================================

// Send new appointment notification to doctor
export const sendNewAppointmentToDoctor = async (appointmentData) => {
    try {
        const notification = new Notification({
            doctorId: appointmentData.docId,
            appointmentId: appointmentData._id,
            type: 'appointment_confirmation',
            title: 'New Appointment Booked',
            message: `New appointment with ${appointmentData.userData.name} scheduled for ${appointmentData.slotDate} at ${appointmentData.slotTime}.`,
            recipientType: 'doctor',
            sentAt: new Date()
        });
        await notification.save();
        
        // Also notify admin about new booking
        const adminNotification = new Notification({
            appointmentId: appointmentData._id,
            type: 'appointment_confirmation',
            title: 'New Appointment',
            message: `${appointmentData.userData.name} booked an appointment with Dr. ${appointmentData.docData.name} for ${appointmentData.slotDate} at ${appointmentData.slotTime}.`,
            recipientType: 'admin',
            sentAt: new Date()
        });
        await adminNotification.save();
        
        return notification;
    } catch (error) {
        console.error('Error sending new appointment notification to doctor:', error);
        throw error;
    }
};

// Send cancellation notification to patient (when doctor cancels)
export const sendCancellationToPatient = async (appointmentData, cancelledBy = 'doctor') => {
    try {
        const notification = new Notification({
            userId: appointmentData.userId,
            appointmentId: appointmentData._id,
            type: 'cancellation_alert',
            title: 'Appointment Cancelled',
            message: `Your appointment with Dr. ${appointmentData.docData.name} on ${appointmentData.slotDate} at ${appointmentData.slotTime} has been cancelled by the ${cancelledBy}. Please book a new appointment.`,
            recipientType: 'patient',
            sentAt: new Date()
        });
        await notification.save();
        
        // Also notify admin
        const adminNotification = new Notification({
            appointmentId: appointmentData._id,
            type: 'cancellation_alert',
            title: 'Doctor Cancelled Appointment',
            message: `Dr. ${appointmentData.docData.name} cancelled appointment with ${appointmentData.userData.name} on ${appointmentData.slotDate} at ${appointmentData.slotTime}.`,
            recipientType: 'admin',
            sentAt: new Date()
        });
        await adminNotification.save();
        
        return notification;
    } catch (error) {
        console.error('Error sending cancellation to patient:', error);
        throw error;
    }
};

// Send appointment completed notification to patient
export const sendAppointmentCompleted = async (appointmentData) => {
    try {
        const notification = new Notification({
            userId: appointmentData.userId,
            appointmentId: appointmentData._id,
            type: 'general',
            title: 'Appointment Completed',
            message: `Your appointment with Dr. ${appointmentData.docData.name} on ${appointmentData.slotDate} has been marked as completed. Thank you for visiting Kaga Health!`,
            recipientType: 'patient',
            sentAt: new Date()
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error sending completion notification:', error);
        throw error;
    }
};

// ============================================
// RESCHEDULE NOTIFICATIONS
// ============================================

// Send reschedule notification to doctor and patient
export const sendRescheduleNotification = async (appointmentData, oldDate, oldTime, rescheduledBy = 'patient') => {
    try {
        const notifications = [];
        
        // Notify doctor about the reschedule
        const doctorNotification = new Notification({
            doctorId: appointmentData.docId,
            appointmentId: appointmentData._id,
            type: 'appointment_rescheduled',
            title: 'Appointment Rescheduled',
            message: `Appointment with ${appointmentData.userData.name} has been rescheduled from ${oldDate} at ${oldTime} to ${appointmentData.slotDate} at ${appointmentData.slotTime}.`,
            recipientType: 'doctor',
            sentAt: new Date()
        });
        await doctorNotification.save();
        notifications.push(doctorNotification);

        // Notify patient about the reschedule confirmation
        const patientNotification = new Notification({
            userId: appointmentData.userId,
            appointmentId: appointmentData._id,
            type: 'appointment_rescheduled',
            title: 'Appointment Rescheduled',
            message: `Your appointment with Dr. ${appointmentData.docData.name} has been rescheduled from ${oldDate} at ${oldTime} to ${appointmentData.slotDate} at ${appointmentData.slotTime}.`,
            recipientType: 'patient',
            sentAt: new Date()
        });
        await patientNotification.save();
        notifications.push(patientNotification);

        // Notify admin about the reschedule
        const adminNotification = new Notification({
            appointmentId: appointmentData._id,
            type: 'appointment_rescheduled',
            title: 'Appointment Rescheduled',
            message: `Appointment between Dr. ${appointmentData.docData.name} and ${appointmentData.userData.name} rescheduled from ${oldDate} at ${oldTime} to ${appointmentData.slotDate} at ${appointmentData.slotTime} by ${rescheduledBy}.`,
            recipientType: 'admin',
            sentAt: new Date()
        });
        await adminNotification.save();
        notifications.push(adminNotification);

        return notifications;
    } catch (error) {
        console.error('Error sending reschedule notification:', error);
        throw error;
    }
};

// ============================================
// REMINDER SCHEDULER (Run as cron job)
// ============================================

// Get appointments that need reminders (24 hours before)
export const processAppointmentReminders = async (req, res) => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = `${tomorrow.getDate()}_${tomorrow.getMonth() + 1}_${tomorrow.getFullYear()}`;

        // Find appointments for tomorrow that haven't been reminded
        const appointments = await appointmentModel.find({
            slotDate: tomorrowStr,
            cancelled: false,
            isCompleted: false
        });

        const reminders = [];
        for (const appointment of appointments) {
            // Check if reminder already sent
            const existingReminder = await Notification.findOne({
                appointmentId: appointment._id,
                type: 'appointment_reminder'
            });

            if (!existingReminder) {
                const reminder = await sendAppointmentReminder(appointment);
                reminders.push(reminder);
            }
        }

        res.json({ 
            success: true, 
            message: `Sent ${reminders.length} reminders`,
            reminders 
        });
    } catch (error) {
        console.error('Error processing reminders:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// API ENDPOINTS
// ============================================

// Create a new notification
export const createNotification = async (req, res) => {
    try {
        const { userId, doctorId, type, title, message, recipientType } = req.body;
        
        const newNotification = new Notification({ 
            userId, 
            doctorId,
            type: type || 'general',
            title: title || 'Notification',
            message,
            recipientType: recipientType || 'patient',
            sentAt: new Date()
        });
        await newNotification.save();
        res.status(201).json({ success: true, notification: newNotification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating notification', error: error.message });
    }
};

// Get all notifications for a user (patient)
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ 
            userId,
            recipientType: 'patient'
        }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
    }
};

// Get all notifications for a doctor
export const getDoctorNotifications = async (req, res) => {
    try {
        const { docId } = req.body;
        const notifications = await Notification.find({ 
            doctorId: docId,
            recipientType: 'doctor'
        }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
    }
};

// Get all notifications for admin
export const getAdminNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            recipientType: 'admin'
        }).sort({ createdAt: -1 }).limit(100);
        
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
    }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
    try {
        const { userId, doctorId, isAdmin } = req.body;
        
        let query = { isRead: false };
        if (isAdmin) {
            query.recipientType = 'admin';
        } else if (doctorId) {
            query.doctorId = doctorId;
            query.recipientType = 'doctor';
        } else if (userId) {
            query.userId = userId;
            query.recipientType = 'patient';
        }

        const count = await Notification.countDocuments(query);
        res.status(200).json({ success: true, unreadCount: count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error counting notifications', error: error.message });
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id, 
            { isRead: true }, 
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating notification', error: error.message });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const { userId, doctorId, isAdmin } = req.body;
        
        let query = {};
        if (isAdmin) {
            query.recipientType = 'admin';
        } else if (doctorId) {
            query.doctorId = doctorId;
            query.recipientType = 'doctor';
        } else if (userId) {
            query.userId = userId;
            query.recipientType = 'patient';
        }

        await Notification.updateMany(query, { isRead: true });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating notifications', error: error.message });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting notification', error: error.message });
    }
};
