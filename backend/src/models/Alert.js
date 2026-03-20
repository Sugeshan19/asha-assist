const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  screening: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screening',
    required: true
  },
  alertedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  alertedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  alertType: {
    type: String,
    enum: ['sms', 'push', 'email', 'system'],
    default: 'sms'
  },
  message: { type: String, required: true },
  recipientPhone: { type: String },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'High'
  },
  disease: { type: String },
  village: { type: String },
  twilioSid: { type: String },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending', 'acknowledged'],
    default: 'pending'
  },
  errorMessage: { type: String },
  acknowledgedAt: { type: Date }
}, { timestamps: true });

alertSchema.index({ patient: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
