const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  temperature: { type: Number },        // Celsius
  pulse: { type: Number },              // bpm
  oxygenLevel: { type: Number },        // SpO2 %
  bloodPressureSystolic: { type: Number },
  bloodPressureDiastolic: { type: Number },
  weight: { type: Number },             // kg
  recordedAt: { type: Date, default: Date.now }
});

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    maxlength: 100
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 0,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  phone: { type: String, trim: true },
  village: {
    type: String,
    required: [true, 'Village is required'],
    trim: true
  },
  district: { type: String, trim: true },
  state: { type: String, trim: true, default: 'Madhya Pradesh' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }    // [lng, lat]
  },
  symptoms: [{ type: String, trim: true }],
  vitals: [vitalSchema],
  prescriptionPhoto: { type: String },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastScreeningId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screening'
  },
  latestDisease: {
    type: String,
    default: 'Unknown'
  },
  doctorReview: {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorName: { type: String },
    comments: { type: String, maxlength: 1000 },
    urgency: { type: String, enum: ['Normal', 'High Priority', 'Immediate'], default: 'Normal' },
    followUpActions: [{ type: String }],
    reviewedAt: { type: Date }
  },
  currentRiskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
  },
  notes: { type: String, maxlength: 1000 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

patientSchema.index({ location: '2dsphere' });
patientSchema.index({ village: 1 });
patientSchema.index({ currentRiskLevel: 1 });

patientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PA${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
