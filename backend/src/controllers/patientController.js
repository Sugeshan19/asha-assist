const Patient = require('../models/Patient');
const Screening = require('../models/Screening');

exports.createPatient = async (req, res) => {
  try {
    const {
      name, age, gender, phone, village, district, state,
      symptoms, notes, coordinates
    } = req.body;

    const patientData = {
      name, age, gender, phone, village, district, state,
      symptoms: symptoms || [],
      notes,
      registeredBy: req.user.id
    };

    if (coordinates && coordinates.length === 2) {
      patientData.location = { type: 'Point', coordinates };
    }

    const patient = await Patient.create(patientData);
    res.status(201).json({ patient });
  } catch (err) {
    console.error('createPatient error:', err);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};

exports.addDoctorReview = async (req, res) => {
  try {
    const { comments, urgency, followUpActions } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    patient.doctorReview = {
      doctorId: req.user.id,
      doctorName: req.user.name,
      comments,
      urgency: urgency || 'Normal',
      followUpActions: followUpActions || [],
      reviewedAt: new Date()
    };

    await patient.save();

    // Create a notification for the ASHA worker who registered the patient
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: patient.registeredBy,
        sender: req.user.id,
        patient: patient._id,
        type: 'review',
        message: `Dr. ${req.user.name} reviewed patient ${patient.name}. Urgency: ${patient.doctorReview.urgency}.`
      });
    } catch (e) { console.error('Silent Notification Error:', e); }

    res.json({ success: true, patient });
  } catch (err) {
    console.error('addDoctorReview error:', err);
    res.status(500).json({ error: 'Failed to add doctor review' });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const {
      village, riskLevel, search, gender, disease, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc'
    } = req.query;

    const filter = { isActive: true };
    if (village) filter.village = new RegExp(village, 'i');
    if (riskLevel) filter.currentRiskLevel = riskLevel;
    if (gender) filter.gender = gender;
    if (disease) filter.latestDisease = new RegExp(disease, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { patientId: new RegExp(search, 'i') },
        { village: new RegExp(search, 'i') }
      ];
    }

    // ASHA workers only see their own patients
    if (req.user.role === 'asha') {
      filter.registeredBy = req.user.id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate('registeredBy', 'name role')
        .populate('lastScreeningId', 'aiResult createdAt')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Patient.countDocuments(filter)
    ]);

    res.json({
      patients,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('getPatients error:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('registeredBy', 'name role phone');

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const screenings = await Screening.find({ patient: patient._id })
      .populate('conductedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ patient, screenings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
};

exports.getPatientsByVillage = async (req, res) => {
  try {
    const patients = await Patient.find({ village: req.params.village, isActive: true })
      .populate('lastScreeningId', 'aiResult createdAt');
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients by village' });
  }
};

exports.getHighRiskPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ currentRiskLevel: 'High', isActive: true })
      .populate('registeredBy', 'name')
      .populate('lastScreeningId', 'aiResult createdAt')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch high risk patients' });
  }
};

exports.getMapPatients = async (req, res) => {
  try {
    const patients = await Patient.find(
      { isActive: true, 'location.coordinates.0': { $ne: 0 } },
      'name village currentRiskLevel location patientId age gender'
    ).populate('lastScreeningId', 'aiResult.diseasePrediction aiResult.riskLevel createdAt');
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
};
