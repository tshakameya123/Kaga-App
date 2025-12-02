import mongoose from "mongoose";

// Medical report/notes schema for patient visits
const reportSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    // Visit details
    visitDate: { type: Date, required: true },
    chiefComplaint: { type: String },
    diagnosis: { type: String },
    treatment: { type: String },
    prescription: { type: String },
    notes: { type: String },
    // Vitals
    vitals: {
        bloodPressure: { type: String },
        heartRate: { type: Number },
        temperature: { type: Number },
        weight: { type: Number },
        height: { type: Number }
    },
    // Follow-up
    followUpDate: { type: Date },
    followUpNotes: { type: String },
    // Status
    status: { 
        type: String, 
        enum: ['draft', 'completed', 'reviewed'],
        default: 'draft'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
reportSchema.index({ userId: 1, visitDate: -1 });
reportSchema.index({ doctorId: 1, visitDate: -1 });
reportSchema.index({ appointmentId: 1 });

// Update timestamp on save
reportSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const reportModel = mongoose.models.report || mongoose.model("report", reportSchema);
export default reportModel;
