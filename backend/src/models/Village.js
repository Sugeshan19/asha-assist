const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  district: { type: String, trim: true },
  state: { type: String, trim: true, default: 'Madhya Pradesh' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }   // [lng, lat]
  },
  population: { type: Number },
  assignedAsha: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  phcName: { type: String },           // Primary Health Center
  phcDistance: { type: Number },       // km

  // Aggregated stats (updated via analytics job)
  stats: {
    totalPatients: { type: Number, default: 0 },
    highRiskCount: { type: Number, default: 0 },
    activeCases: { type: Number, default: 0 },
    lastUpdated: { type: Date }
  }
}, { timestamps: true });

villageSchema.index({ location: '2dsphere' });
villageSchema.index({ name: 1, district: 1 }, { unique: true });

module.exports = mongoose.model('Village', villageSchema);
