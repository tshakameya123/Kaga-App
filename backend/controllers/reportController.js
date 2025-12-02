import reportModel from '../models/reportModel.js';
import appointmentModel from '../models/AppointmentModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';

// ============================================
// PATIENT HISTORY MANAGEMENT
// ============================================

// Create a visit report/notes
export const createVisitReport = async (req, res) => {
    try {
        const { 
            docId, 
            appointmentId, 
            chiefComplaint, 
            diagnosis, 
            treatment, 
            prescription, 
            notes,
            vitals,
            followUpDate,
            followUpNotes 
        } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Verify doctor owns this appointment
        if (appointment.docId !== docId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const report = new reportModel({
            appointmentId,
            doctorId: docId,
            userId: appointment.userId,
            visitDate: new Date(),
            chiefComplaint,
            diagnosis,
            treatment,
            prescription,
            notes,
            vitals,
            followUpDate,
            followUpNotes,
            status: 'completed'
        });

        await report.save();

        res.status(201).json({ success: true, message: 'Visit report created', report });
    } catch (error) {
        console.error('Error creating visit report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update visit report
export const updateVisitReport = async (req, res) => {
    try {
        const { reportId, docId, ...updateData } = req.body;

        const report = await reportModel.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Verify doctor owns this report
        if (report.doctorId.toString() !== docId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        Object.assign(report, updateData);
        await report.save();

        res.json({ success: true, message: 'Visit report updated', report });
    } catch (error) {
        console.error('Error updating visit report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get patient history (for doctors)
export const getPatientHistory = async (req, res) => {
    try {
        const { docId, patientId } = req.body;

        // Get all visit reports for this patient
        const reports = await reportModel.find({ userId: patientId })
            .sort({ visitDate: -1 })
            .populate('doctorId', 'name speciality');

        // Get all appointments for this patient
        const appointments = await appointmentModel.find({ 
            userId: patientId,
            isCompleted: true 
        }).sort({ date: -1 });

        // Get patient info
        const patient = await userModel.findById(patientId).select('-password');

        res.json({ 
            success: true, 
            patient,
            history: {
                reports,
                completedAppointments: appointments.length,
                lastVisit: appointments[0]?.slotDate || null
            }
        });
    } catch (error) {
        console.error('Error getting patient history:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get report by appointment
export const getReportByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const report = await reportModel.findOne({ appointmentId })
            .populate('doctorId', 'name speciality');

        if (!report) {
            return res.json({ success: true, report: null });
        }

        res.json({ success: true, report });
    } catch (error) {
        console.error('Error getting report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// DAILY APPOINTMENT SUMMARY
// ============================================

// Get daily appointment summary
export const getDailySummary = async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || getTodayDateString();

        const appointments = await appointmentModel.find({
            slotDate: targetDate,
            cancelled: false
        }).sort({ slotTime: 1 });

        // Group by doctor
        const byDoctor = {};
        for (const apt of appointments) {
            const docName = apt.docData.name;
            if (!byDoctor[docName]) {
                byDoctor[docName] = {
                    doctorId: apt.docId,
                    doctorName: docName,
                    speciality: apt.docData.speciality,
                    appointments: []
                };
            }
            byDoctor[docName].appointments.push({
                time: apt.slotTime,
                patient: apt.userData.name,
                patientPhone: apt.userData.phone,
                status: apt.isCompleted ? 'completed' : 'scheduled'
            });
        }

        const summary = {
            date: targetDate,
            totalAppointments: appointments.length,
            completedCount: appointments.filter(a => a.isCompleted).length,
            pendingCount: appointments.filter(a => !a.isCompleted).length,
            byDoctor: Object.values(byDoctor)
        };

        res.json({ success: true, summary });
    } catch (error) {
        console.error('Error getting daily summary:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get doctor's daily summary
export const getDoctorDailySummary = async (req, res) => {
    try {
        const { docId, date } = req.body;
        const targetDate = date || getTodayDateString();

        const appointments = await appointmentModel.find({
            docId,
            slotDate: targetDate,
            cancelled: false
        }).sort({ slotTime: 1 });

        const summary = {
            date: targetDate,
            totalAppointments: appointments.length,
            completedCount: appointments.filter(a => a.isCompleted).length,
            pendingCount: appointments.filter(a => !a.isCompleted).length,
            appointments: appointments.map(apt => ({
                id: apt._id,
                time: apt.slotTime,
                patient: apt.userData.name,
                patientEmail: apt.userData.email,
                patientPhone: apt.userData.phone,
                status: apt.isCompleted ? 'completed' : 'scheduled'
            }))
        };

        res.json({ success: true, summary });
    } catch (error) {
        console.error('Error getting doctor daily summary:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// REPORTING AND ANALYTICS
// ============================================

// Get appointment statistics
export const getAppointmentStats = async (req, res) => {
    try {
        const { startDate, endDate, period } = req.body;

        // Get all appointments in date range
        const appointments = await appointmentModel.find({});

        // Filter by date range if provided
        let filteredAppointments = appointments;
        if (startDate && endDate) {
            filteredAppointments = appointments.filter(apt => {
                return apt.slotDate >= startDate && apt.slotDate <= endDate;
            });
        }

        // Calculate statistics
        const totalAppointments = filteredAppointments.length;
        const completedAppointments = filteredAppointments.filter(a => a.isCompleted).length;
        const cancelledAppointments = filteredAppointments.filter(a => a.cancelled).length;
        const pendingAppointments = filteredAppointments.filter(a => !a.isCompleted && !a.cancelled).length;
        const noShowRate = totalAppointments > 0 
            ? ((cancelledAppointments / totalAppointments) * 100).toFixed(2) 
            : 0;

        // Group by speciality
        const bySpeciality = {};
        for (const apt of filteredAppointments) {
            const spec = apt.docData.speciality || 'General';
            bySpeciality[spec] = (bySpeciality[spec] || 0) + 1;
        }

        // Weekly breakdown
        const weeklyStats = {};
        for (const apt of filteredAppointments) {
            const [day, month, year] = apt.slotDate.split('_').map(Number);
            const date = new Date(year, month - 1, day);
            const weekStart = getWeekStart(date);
            const weekKey = weekStart.toISOString().split('T')[0];
            weeklyStats[weekKey] = (weeklyStats[weekKey] || 0) + 1;
        }

        res.json({
            success: true,
            stats: {
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                pendingAppointments,
                completionRate: totalAppointments > 0 
                    ? ((completedAppointments / totalAppointments) * 100).toFixed(2) 
                    : 0,
                noShowRate,
                bySpeciality,
                weeklyBreakdown: weeklyStats,
                mostPopularSpecialities: Object.entries(bySpeciality)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
            }
        });
    } catch (error) {
        console.error('Error getting appointment stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get patient statistics
export const getPatientStats = async (req, res) => {
    try {
        const patients = await userModel.find({}).select('-password');
        const appointments = await appointmentModel.find({});

        // Count visits per patient
        const visitCounts = {};
        for (const apt of appointments) {
            if (!apt.cancelled) {
                visitCounts[apt.userId] = (visitCounts[apt.userId] || 0) + 1;
            }
        }

        // Find frequent visitors (more than 3 visits)
        const frequentVisitors = patients
            .filter(p => (visitCounts[p._id.toString()] || 0) > 3)
            .map(p => ({
                id: p._id,
                name: p.name,
                email: p.email,
                visitCount: visitCounts[p._id.toString()] || 0
            }))
            .sort((a, b) => b.visitCount - a.visitCount);

        // New patients this month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const newPatientsThisMonth = patients.filter(p => {
            const createdAt = new Date(p.date || p.createdAt);
            return createdAt >= monthStart;
        }).length;

        // Visit patterns (by day of week)
        const visitPatterns = {
            sunday: 0, monday: 0, tuesday: 0, wednesday: 0,
            thursday: 0, friday: 0, saturday: 0
        };
        for (const apt of appointments) {
            if (!apt.cancelled) {
                const [day, month, year] = apt.slotDate.split('_').map(Number);
                const date = new Date(year, month - 1, day);
                const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
                visitPatterns[dayName]++;
            }
        }

        res.json({
            success: true,
            stats: {
                totalPatients: patients.length,
                newPatientsThisMonth,
                frequentVisitors: frequentVisitors.slice(0, 10),
                averageVisitsPerPatient: patients.length > 0 
                    ? (appointments.filter(a => !a.cancelled).length / patients.length).toFixed(2)
                    : 0,
                visitPatterns,
                busiestDay: Object.entries(visitPatterns).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
            }
        });
    } catch (error) {
        console.error('Error getting patient stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get doctor performance stats
export const getDoctorStats = async (req, res) => {
    try {
        const { docId } = req.body;
        
        const doctor = await doctorModel.findById(docId).select('-password');
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const appointments = await appointmentModel.find({ docId });

        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(a => a.isCompleted).length;
        const cancelledAppointments = appointments.filter(a => a.cancelled).length;

        // Unique patients
        const uniquePatients = new Set(appointments.map(a => a.userId)).size;

        // Monthly breakdown
        const monthlyStats = {};
        for (const apt of appointments) {
            const [day, month, year] = apt.slotDate.split('_').map(Number);
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { total: 0, completed: 0, cancelled: 0 };
            }
            monthlyStats[monthKey].total++;
            if (apt.isCompleted) monthlyStats[monthKey].completed++;
            if (apt.cancelled) monthlyStats[monthKey].cancelled++;
        }

        res.json({
            success: true,
            stats: {
                doctorName: doctor.name,
                speciality: doctor.speciality,
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                completionRate: totalAppointments > 0 
                    ? ((completedAppointments / totalAppointments) * 100).toFixed(2) 
                    : 0,
                uniquePatients,
                totalEarnings: completedAppointments * doctor.fees,
                monthlyBreakdown: monthlyStats
            }
        });
    } catch (error) {
        console.error('Error getting doctor stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate comprehensive report
export const generateReport = async (req, res) => {
    try {
        const { reportType, startDate, endDate, format } = req.body;

        let reportData = {};

        switch (reportType) {
            case 'appointments':
                const aptStats = await getAppointmentStatsData(startDate, endDate);
                reportData = aptStats;
                break;
            case 'patients':
                const patientStats = await getPatientStatsData();
                reportData = patientStats;
                break;
            case 'revenue':
                const revenueData = await getRevenueData(startDate, endDate);
                reportData = revenueData;
                break;
            default:
                // Comprehensive report
                reportData = {
                    appointments: await getAppointmentStatsData(startDate, endDate),
                    patients: await getPatientStatsData(),
                    revenue: await getRevenueData(startDate, endDate)
                };
        }

        res.json({
            success: true,
            report: {
                generatedAt: new Date(),
                dateRange: { startDate, endDate },
                type: reportType || 'comprehensive',
                data: reportData
            }
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTodayDateString() {
    const today = new Date();
    return `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

async function getAppointmentStatsData(startDate, endDate) {
    const appointments = await appointmentModel.find({});
    let filtered = appointments;
    
    if (startDate && endDate) {
        filtered = appointments.filter(apt => 
            apt.slotDate >= startDate && apt.slotDate <= endDate
        );
    }

    return {
        total: filtered.length,
        completed: filtered.filter(a => a.isCompleted).length,
        cancelled: filtered.filter(a => a.cancelled).length,
        pending: filtered.filter(a => !a.isCompleted && !a.cancelled).length
    };
}

async function getPatientStatsData() {
    const patients = await userModel.find({});
    return {
        total: patients.length
    };
}

async function getRevenueData(startDate, endDate) {
    const appointments = await appointmentModel.find({ 
        isCompleted: true,
        cancelled: false 
    });

    let filtered = appointments;
    if (startDate && endDate) {
        filtered = appointments.filter(apt => 
            apt.slotDate >= startDate && apt.slotDate <= endDate
        );
    }

    const totalRevenue = filtered.reduce((sum, apt) => sum + (apt.amount || 0), 0);

    return {
        totalRevenue,
        appointmentCount: filtered.length,
        averagePerAppointment: filtered.length > 0 
            ? (totalRevenue / filtered.length).toFixed(2) 
            : 0
    };
}
