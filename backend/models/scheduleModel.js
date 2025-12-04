import mongoose from "mongoose";

const blockedTimeSchema = new mongoose.Schema({
    date: { type: String, required: true }, // Format: DD_MM_YYYY
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reason: { type: String, default: '' }
});

// Time period schema for granular availability
const timePeriodSchema = new mongoose.Schema({
    isAvailable: { type: Boolean, default: false },
    startTime: { type: String },
    endTime: { type: String }
}, { _id: false });

// Day schedule schema
const dayScheduleSchema = new mongoose.Schema({
    isAvailable: { type: Boolean, default: false },
    // Morning: typically 6:00 AM - 12:00 PM
    morning: {
        type: timePeriodSchema,
        default: { isAvailable: false, startTime: '08:00', endTime: '12:00' }
    },
    // Afternoon: typically 12:00 PM - 5:00 PM
    afternoon: {
        type: timePeriodSchema,
        default: { isAvailable: false, startTime: '12:00', endTime: '17:00' }
    },
    // Evening: typically 5:00 PM - 9:00 PM
    evening: {
        type: timePeriodSchema,
        default: { isAvailable: false, startTime: '17:00', endTime: '21:00' }
    }
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    // Regular weekly availability (day of week -> time slots with periods)
    weeklySchedule: {
        monday: { type: dayScheduleSchema, default: () => ({ isAvailable: true, morning: { isAvailable: true, startTime: '08:00', endTime: '12:00' }, afternoon: { isAvailable: true, startTime: '12:00', endTime: '17:00' }, evening: { isAvailable: false, startTime: '17:00', endTime: '21:00' } }) },
        tuesday: { type: dayScheduleSchema, default: () => ({ isAvailable: true, morning: { isAvailable: true, startTime: '08:00', endTime: '12:00' }, afternoon: { isAvailable: true, startTime: '12:00', endTime: '17:00' }, evening: { isAvailable: false, startTime: '17:00', endTime: '21:00' } }) },
        wednesday: { type: dayScheduleSchema, default: () => ({ isAvailable: true, morning: { isAvailable: true, startTime: '08:00', endTime: '12:00' }, afternoon: { isAvailable: true, startTime: '12:00', endTime: '17:00' }, evening: { isAvailable: false, startTime: '17:00', endTime: '21:00' } }) },
        thursday: { type: dayScheduleSchema, default: () => ({ isAvailable: true, morning: { isAvailable: true, startTime: '08:00', endTime: '12:00' }, afternoon: { isAvailable: true, startTime: '12:00', endTime: '17:00' }, evening: { isAvailable: false, startTime: '17:00', endTime: '21:00' } }) },
        friday: { type: dayScheduleSchema, default: () => ({ isAvailable: true, morning: { isAvailable: true, startTime: '08:00', endTime: '12:00' }, afternoon: { isAvailable: true, startTime: '12:00', endTime: '17:00' }, evening: { isAvailable: false, startTime: '17:00', endTime: '21:00' } }) },
        saturday: { type: dayScheduleSchema, default: () => ({ isAvailable: false, morning: { isAvailable: false, startTime: '09:00', endTime: '12:00' }, afternoon: { isAvailable: false, startTime: '12:00', endTime: '14:00' }, evening: { isAvailable: false, startTime: '17:00', endTime: '21:00' } }) },
        sunday: { type: dayScheduleSchema, default: () => ({ isAvailable: false, morning: { isAvailable: false, startTime: '09:00', endTime: '12:00' }, afternoon: { isAvailable: false, startTime: '12:00', endTime: '14:00' }, evening: { isAvailable: false, startTime: '17:00', endTime: '21:00' } }) }
    },
    // Blocked times (vacations, meetings, etc.)
    blockedTimes: [blockedTimeSchema],
    // Slot duration in minutes
    slotDuration: { type: Number, default: 30 },
    // Maximum patients per day
    maxPatientsPerDay: { type: Number, default: 20 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
scheduleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
scheduleSchema.index({ doctorId: 1 });

const scheduleModel = mongoose.models.schedule || mongoose.model("schedule", scheduleSchema);
export default scheduleModel;
