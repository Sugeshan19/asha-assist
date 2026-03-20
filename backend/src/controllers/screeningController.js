const axios = require('axios');
const Patient = require('../models/Patient');
const Screening = require('../models/Screening');
const Alert = require('../models/Alert');
const { sendDoctorAlert } = require('../utils/smsService');
const User = require('../models/User');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.createScreening = async (req, res) => {
  try {
    const {
      patientId, symptoms, vitals, inputMethod, rawVoiceInput
    } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Call AI service for screening
    let aiResult = {
      diseasePrediction: 'Unknown',
      riskLevel: 'Low',
      recommendation: 'Monitor symptoms and follow up in 3 days',
      confidence: 0.5,
      differentials: []
    };

    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, {
        symptoms: symptoms || [],
        vitals: vitals || {},
        age: patient.age,
        gender: patient.gender
      }, { timeout: 10000 });
      const normalized = aiResponse.data || {};
      aiResult = {
        diseasePrediction: normalized.diseasePrediction || normalized.disease_prediction || 'Unknown',
        riskLevel: normalized.riskLevel || normalized.risk_level || 'Low',
        recommendation: normalized.recommendation || 'Monitor symptoms and follow up in 3 days',
        confidence: normalized.confidence ?? 0.5,
        differentials: normalized.differentials || [],
        aiModel: normalized.aiModel || normalized.ai_model || 'rule-based-v1'
      };
    } catch (aiErr) {
      console.warn('AI service unavailable, using default result:', aiErr.message);
    }

    const screening = await Screening.create({
      patient: patientId,
      conductedBy: req.user.id,
      symptoms,
      vitals,
      inputMethod,
      rawVoiceInput,
      aiResult
    });

    // Update patient risk level and last screening
    await Patient.findByIdAndUpdate(patientId, {
      currentRiskLevel: aiResult.riskLevel,
      lastScreeningId: screening._id,
      $push: { vitals: { ...vitals, recordedAt: new Date() } }
    });

    // Send alert if high risk
    let alert = null;
    if (aiResult.riskLevel === 'High') {
      const doctors = await User.find({ role: 'doctor', isActive: true }).limit(3);
      for (const doctor of doctors) {
        if (doctor.phone) {
          const alertResult = await sendDoctorAlert({
            doctorPhone: doctor.phone,
            patientName: patient.name,
            village: patient.village,
            disease: aiResult.diseasePrediction,
            riskLevel: aiResult.riskLevel
          });

          alert = await Alert.create({
            patient: patientId,
            screening: screening._id,
            alertedBy: req.user.id,
            alertedDoctor: doctor._id,
            alertType: 'sms',
            message: alertResult.message,
            recipientPhone: doctor.phone,
            riskLevel: aiResult.riskLevel,
            disease: aiResult.diseasePrediction,
            village: patient.village,
            twilioSid: alertResult.sid,
            status: alertResult.success ? 'sent' : 'failed',
            errorMessage: alertResult.error
          });

          await Screening.findByIdAndUpdate(screening._id, {
            alertSent: true,
            alertId: alert._id
          });
        }
      }
    }

    await screening.populate('conductedBy', 'name role');
    res.status(201).json({ screening, alert });
  } catch (err) {
    console.error('createScreening error:', err);
    res.status(500).json({ error: 'Failed to create screening' });
  }
};

exports.getScreeningsByPatient = async (req, res) => {
  try {
    const screenings = await Screening.find({ patient: req.params.patientId })
      .populate('conductedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ screenings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
};

exports.getScreeningById = async (req, res) => {
  try {
    const screening = await Screening.findById(req.params.id)
      .populate('patient')
      .populate('conductedBy', 'name role');
    if (!screening) return res.status(404).json({ error: 'Screening not found' });
    res.json({ screening });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch screening' });
  }
};

exports.doctorReview = async (req, res) => {
  try {
    const { reviewNotes, finalDiagnosis, treatmentPlan } = req.body;
    const screening = await Screening.findByIdAndUpdate(
      req.params.id,
      {
        'doctorReview.reviewedBy': req.user.id,
        'doctorReview.reviewedAt': new Date(),
        'doctorReview.doctorNotes': reviewNotes,
        'doctorReview.finalDiagnosis': finalDiagnosis,
        'doctorReview.treatmentPlan': treatmentPlan,
        status: 'reviewed'
      },
      { new: true }
    ).populate('patient').populate('conductedBy', 'name role');
    if (!screening) return res.status(404).json({ error: 'Screening not found' });
    res.json({ screening });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};

exports.getRecentScreenings = async (req, res) => {
  try {
    const { limit = 20, riskLevel } = req.query;
    const filter = {};
    if (riskLevel) filter['aiResult.riskLevel'] = riskLevel;

    const screenings = await Screening.find(filter)
      .populate('patient', 'name age village gender patientId')
      .populate('conductedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ screenings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent screenings' });
  }
};
