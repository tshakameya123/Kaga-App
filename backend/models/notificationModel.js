import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: false }, // For patient notifications
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: false }, // For doctor notifications
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment', required: false },
    type: { 
        type: String, 
        enum: ['appointment_confirmation', 'appointment_reminder', 'appointment_rescheduled', 'cancellation_alert', 'schedule_change', 'general'],
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    recipientType: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
    scheduledFor: { type: Date }, // For scheduling reminders
    sentAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ doctorId: 1, isRead: 1 });
notificationSchema.index({ scheduledFor: 1, sentAt: 1 });

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);
export default notificationModel;
