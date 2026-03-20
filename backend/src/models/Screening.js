const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: [{ type: String }],
  vitals: {
    temperature: Number,
    pulse: Number,
    oxygenLevel: Number,
    bloodPressureSystolic: Number,
    bloodPressureDiastolic: Number,
    weight: Number
  },
  inputMethod: {
    type: String,
    enum: ['text', 'voice', 'form'],
    default: 'form'
  },
  rawVoiceInput: { type: String },

  // AI Results
  aiResult: {
    diseasePrediction: { type: String },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    },
    recommendation: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    differentials: [{ disease: String, probability: Number }],
    aiModel: { type: String, default: 'rule-based-v1' }
  },

  // Doctor review
  doctorReview: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    doctorNotes: String,
    finalDiagnosis: String,
    treatmentPlan: String
  },

  alertSent: { type: Boolean, default: false },
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },

  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  }
}, { timestamps: true });

screeningSchema.index({ patient: 1, createdAt: -1 });
screeningSchema.index({ 'aiResult.riskLevel': 1 });
screeningSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Screening', screeningSchema);
