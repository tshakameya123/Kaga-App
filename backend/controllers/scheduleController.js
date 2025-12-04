import scheduleModel from '../models/scheduleModel.js';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/AppointmentModel.js';
import { sendScheduleChangeAlert } from './notificationController.js';

// ============================================
// DOCTOR SCHEDULE MANAGEMENT
// ============================================

// Get doctor's schedule
export const getDoctorSchedule = async (req, res) => {
    try {
        const { docId } = req.body;
        
        let schedule = await scheduleModel.findOne({ doctorId: docId });
        
        // Create default schedule if not exists
        if (!schedule) {
            schedule = new scheduleModel({ doctorId: docId });
            await schedule.save();
        }

        res.json({ success: true, schedule });
    } catch (error) {
        console.error('Error getting schedule:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update weekly schedule (new structure with periods)
export const updateWeeklySchedule = async (req, res) => {
    try {
        const { docId, weeklySchedule } = req.body;
        
        let schedule = await scheduleModel.findOne({ doctorId: docId });
        
        if (!schedule) {
            schedule = new scheduleModel({ doctorId: docId });
        }
        
        // Update each day's schedule
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        for (const day of days) {
            if (weeklySchedule[day]) {
                schedule.weeklySchedule[day] = {
                    isAvailable: weeklySchedule[day].isAvailable,
                    morning: weeklySchedule[day].morning || schedule.weeklySchedule[day].morning,
                    afternoon: weeklySchedule[day].afternoon || schedule.weeklySchedule[day].afternoon,
                    evening: weeklySchedule[day].evening || schedule.weeklySchedule[day].evening
                };
            }
        }
        
        schedule.markModified('weeklySchedule');
        await schedule.save();

        // Send notification to admin about schedule change
        await sendScheduleChangeAlert(docId, 'Weekly schedule has been updated');

        res.json({ success: true, message: 'Weekly schedule updated', schedule });
    } catch (error) {
        console.error('Error updating weekly schedule:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a specific day's schedule
export const updateDaySchedule = async (req, res) => {
    try {
        const { docId, day, daySchedule } = req.body;
        
        if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day)) {
            return res.status(400).json({ success: false, message: 'Invalid day' });
        }
        
        let schedule = await scheduleModel.findOne({ doctorId: docId });
        
        if (!schedule) {
            schedule = new scheduleModel({ doctorId: docId });
        }
        
        schedule.weeklySchedule[day] = {
            isAvailable: daySchedule.isAvailable,
            morning: daySchedule.morning,
            afternoon: daySchedule.afternoon,
            evening: daySchedule.evening
        };
        
        schedule.markModified('weeklySchedule');
        await schedule.save();

        res.json({ success: true, message: `${day} schedule updated`, schedule });
    } catch (error) {
        console.error('Error updating day schedule:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update slot duration
export const updateSlotDuration = async (req, res) => {
    try {
        const { docId, slotDuration } = req.body;
        
        if (slotDuration < 10 || slotDuration > 120) {
            return res.status(400).json({ 
                success: false, 
                message: 'Slot duration must be between 10 and 120 minutes' 
            });
        }

        let schedule = await scheduleModel.findOne({ doctorId: docId });
        
        if (!schedule) {
            schedule = new scheduleModel({ doctorId: docId, slotDuration });
        } else {
            schedule.slotDuration = slotDuration;
        }
        
        await schedule.save();

        res.json({ success: true, message: 'Slot duration updated', schedule });
    } catch (error) {
        console.error('Error updating slot duration:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Block time slot (vacation, meeting, etc.)
export const blockTimeSlot = async (req, res) => {
    try {
        const { docId, date, startTime, endTime, reason } = req.body;
        
        if (!date || !startTime || !endTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Date, start time, and end time are required' 
            });
        }

        let schedule = await scheduleModel.findOne({ doctorId: docId });
        
        if (!schedule) {
            schedule = new scheduleModel({ doctorId: docId });
        }

        schedule.blockedTimes.push({
            date,
            startTime,
            endTime,
            reason: reason || ''
        });
        
        await schedule.save();

        // Send notification about blocked time
        await sendScheduleChangeAlert(docId, `Time blocked on ${date} from ${startTime} to ${endTime}. Reason: ${reason || 'Not specified'}`);

        res.json({ success: true, message: 'Time slot blocked', schedule });
    } catch (error) {
        console.error('Error blocking time slot:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Unblock time slot
export const unblockTimeSlot = async (req, res) => {
    try {
        const { docId, blockedTimeId } = req.body;
        
        const schedule = await scheduleModel.findOne({ doctorId: docId });
        
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        schedule.blockedTimes = schedule.blockedTimes.filter(
            bt => bt._id.toString() !== blockedTimeId
        );
        
        await schedule.save();

        res.json({ success: true, message: 'Time slot unblocked', schedule });
    } catch (error) {
        console.error('Error unblocking time slot:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get blocked times for a date range
export const getBlockedTimes = async (req, res) => {
    try {
        const { docId, startDate, endDate } = req.body;
        
        const schedule = await scheduleModel.findOne({ doctorId: docId });
        
        if (!schedule) {
            return res.json({ success: true, blockedTimes: [] });
        }

        // Filter blocked times by date range if provided
        let blockedTimes = schedule.blockedTimes;
        
        if (startDate && endDate) {
            blockedTimes = blockedTimes.filter(bt => {
                return bt.date >= startDate && bt.date <= endDate;
            });
        }

        res.json({ success: true, blockedTimes });
    } catch (error) {
        console.error('Error getting blocked times:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to convert 24-hour to 12-hour format
function to12HourFormat(hours, mins) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Helper function to convert 12-hour to 24-hour for comparison
function to24Hour(time12) {
    if (!time12) return '';
    // Handle both "8:00 AM" and "08:00" formats
    if (!time12.includes('AM') && !time12.includes('PM')) {
        return time12; // Already in 24-hour format
    }
    const match = time12.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (!match) return time12;
    
    let hour = parseInt(match[1]);
    const minute = match[2];
    const period = match[3];
    
    if (period === 'PM' && hour !== 12) {
        hour += 12;
    } else if (period === 'AM' && hour === 12) {
        hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute}`;
}

// Helper function to generate time slots in 12-hour format
function generateTimeSlots(startTime, endTime, durationMinutes) {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + durationMinutes <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        // Return in 12-hour format
        slots.push(to12HourFormat(hours, mins));
        currentMinutes += durationMinutes;
    }

    return slots;
}

// Get available slots for a specific date - GROUPED BY PERIOD (morning/afternoon/evening)
export const getAvailableSlots = async (req, res) => {
    try {
        const { docId, doctorId, date } = req.body;
        const targetDocId = docId || doctorId; // Accept both parameter names
        
        if (!targetDocId || !date) {
            return res.json({ 
                success: false, 
                slots: { morning: [], afternoon: [], evening: [] }, 
                allSlots: [],
                message: 'Doctor ID and date are required' 
            });
        }
        
        const doctor = await doctorModel.findById(targetDocId);
        if (!doctor || !doctor.available) {
            return res.json({ 
                success: true, 
                slots: { morning: [], afternoon: [], evening: [] },
                allSlots: [],
                message: 'Doctor not available' 
            });
        }

        const schedule = await scheduleModel.findOne({ doctorId: targetDocId });
        
        // Parse date to get day of week
        const [day, month, year] = date.split('_').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dateObj.getDay()];

        // Get weekly schedule for this day
        const daySchedule = schedule?.weeklySchedule?.[dayOfWeek];

        // If doctor has no schedule set up yet, return default slots
        if (!schedule || !daySchedule) {
            // Generate default slots (fallback when no schedule exists)
            const defaultSlots = generateDefaultSlots(doctor.slots_booked?.[date] || []);
            return res.json({ 
                success: true, 
                slots: defaultSlots.grouped,
                allSlots: defaultSlots.all,
                message: 'Using default schedule (doctor has not set custom availability)' 
            });
        }

        if (!daySchedule.isAvailable) {
            return res.json({ 
                success: true, 
                slots: { morning: [], afternoon: [], evening: [] },
                allSlots: [],
                message: 'Doctor not available on this day' 
            });
        }

        const slotDuration = schedule?.slotDuration || 30;
        const blockedForDate = schedule?.blockedTimes?.filter(bt => bt.date === date) || [];
        const bookedSlots = doctor.slots_booked?.[date] || [];

        // Generate slots for each period
        const periods = ['morning', 'afternoon', 'evening'];
        const result = { morning: [], afternoon: [], evening: [] };

        for (const period of periods) {
            const periodSchedule = daySchedule[period];
            
            if (periodSchedule && periodSchedule.isAvailable && periodSchedule.startTime && periodSchedule.endTime) {
                const slots = generateTimeSlots(periodSchedule.startTime, periodSchedule.endTime, slotDuration);
                
                // Filter out blocked times
                const availableSlots = slots.filter(slot => {
                    const slot24 = to24Hour(slot);
                    // Check if slot is blocked
                    const isBlocked = blockedForDate.some(bt => {
                        return slot24 >= bt.startTime && slot24 < bt.endTime;
                    });
                    // Check if slot is already booked (could be in either format)
                    const isBooked = bookedSlots.includes(slot) || bookedSlots.includes(slot24);
                    
                    return !isBlocked && !isBooked;
                });

                result[period] = availableSlots;
            }
        }

        // Also return flat array for backward compatibility
        const allSlots = [...result.morning, ...result.afternoon, ...result.evening];

        res.json({ 
            success: true, 
            slots: result,
            allSlots: allSlots,
            daySchedule: daySchedule,
            slotDuration: slotDuration
        });
    } catch (error) {
        console.error('Error getting available slots:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate default slots when doctor has no schedule configured
function generateDefaultSlots(bookedSlots = []) {
    const grouped = { morning: [], afternoon: [], evening: [] };
    const all = [];
    
    // Morning: 8:00 AM - 12:00 PM
    for (let h = 8; h < 12; h++) {
        for (let m = 0; m < 60; m += 30) {
            const slot = to12HourFormat(h, m);
            const slot24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            if (!bookedSlots.includes(slot) && !bookedSlots.includes(slot24)) {
                grouped.morning.push(slot);
                all.push(slot);
            }
        }
    }
    
    // Afternoon: 12:00 PM - 5:00 PM
    for (let h = 12; h < 17; h++) {
        for (let m = 0; m < 60; m += 30) {
            const slot = to12HourFormat(h, m);
            const slot24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            if (!bookedSlots.includes(slot) && !bookedSlots.includes(slot24)) {
                grouped.afternoon.push(slot);
                all.push(slot);
            }
        }
    }
    
    // Evening: 5:00 PM - 9:00 PM
    for (let h = 17; h < 21; h++) {
        for (let m = 0; m < 60; m += 30) {
            const slot = to12HourFormat(h, m);
            const slot24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            if (!bookedSlots.includes(slot) && !bookedSlots.includes(slot24)) {
                grouped.evening.push(slot);
                all.push(slot);
            }
        }
    }
    
    return { grouped, all };
}

// Get available slots for all doctors in a department/speciality
export const getAvailableSlotsBySpeciality = async (req, res) => {
    try {
        const { speciality, date } = req.body;
        
        // Get all available doctors with this speciality
        const doctors = await doctorModel.find({ 
            speciality: speciality, 
            available: true 
        }).select('_id name image fees');

        const result = [];

        for (const doctor of doctors) {
            const schedule = await scheduleModel.findOne({ doctorId: doctor._id });
            
            // Parse date to get day of week
            const [day, month, year] = date.split('_').map(Number);
            const dateObj = new Date(year, month - 1, day);
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dateObj.getDay()];

            const daySchedule = schedule?.weeklySchedule?.[dayOfWeek];

            if (daySchedule && daySchedule.isAvailable) {
                const slotDuration = schedule?.slotDuration || 30;
                const blockedForDate = schedule?.blockedTimes?.filter(bt => bt.date === date) || [];
                const bookedSlots = doctor.slots_booked?.[date] || [];

                const periods = ['morning', 'afternoon', 'evening'];
                const doctorSlots = { morning: [], afternoon: [], evening: [] };

                for (const period of periods) {
                    const periodSchedule = daySchedule[period];
                    
                    if (periodSchedule && periodSchedule.isAvailable && periodSchedule.startTime && periodSchedule.endTime) {
                        const slots = generateTimeSlots(periodSchedule.startTime, periodSchedule.endTime, slotDuration);
                        
                        const availableSlots = slots.filter(slot => {
                            const isBlocked = blockedForDate.some(bt => slot >= bt.startTime && slot < bt.endTime);
                            const isBooked = bookedSlots.includes(slot);
                            return !isBlocked && !isBooked;
                        });

                        doctorSlots[period] = availableSlots;
                    }
                }

                const totalSlots = doctorSlots.morning.length + doctorSlots.afternoon.length + doctorSlots.evening.length;
                
                if (totalSlots > 0) {
                    result.push({
                        doctor: {
                            _id: doctor._id,
                            name: doctor.name,
                            image: doctor.image,
                            fees: doctor.fees
                        },
                        slots: doctorSlots,
                        totalSlots: totalSlots
                    });
                }
            }
        }

        res.json({ success: true, doctors: result });
    } catch (error) {
        console.error('Error getting slots by speciality:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update max patients per day
export const updateMaxPatients = async (req, res) => {
    try {
        const { docId, maxPatientsPerDay } = req.body;
        
        if (maxPatientsPerDay < 1 || maxPatientsPerDay > 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Max patients must be between 1 and 100' 
            });
        }

        let schedule = await scheduleModel.findOne({ doctorId: docId });
        
        if (!schedule) {
            schedule = new scheduleModel({ doctorId: docId, maxPatientsPerDay });
        } else {
            schedule.maxPatientsPerDay = maxPatientsPerDay;
        }
        
        await schedule.save();

        res.json({ success: true, message: 'Max patients per day updated', schedule });
    } catch (error) {
        console.error('Error updating max patients:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
