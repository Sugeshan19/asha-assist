const Screening = require('../models/Screening');
const Patient = require('../models/Patient');
const Alert = require('../models/Alert');
const Village = require('../models/Village');

exports.getSummary = async (req, res) => {
  try {
    const [
      totalPatients,
      highRiskCount,
      totalScreenings,
      pendingAlerts,
      activeAlerts
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Patient.countDocuments({ currentRiskLevel: 'High', isActive: true }),
      Screening.countDocuments(),
      Screening.countDocuments({ status: 'pending' }),
      Alert.countDocuments({ status: { $in: ['sent', 'pending'] } })
    ]);

    res.json({
      totalPatients,
      highRiskCount,
      totalScreenings,
      pendingAlerts,
      activeAlerts
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get summary' });
  }
};

exports.getDiseaseStats = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    let days = 30;
    if (timeframe === 'week') days = 7;
    if (timeframe === 'year') days = 365;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const diseaseStats = await Screening.aggregate([
      { $match: { createdAt: { $gte: since }, 'aiResult.diseasePrediction': { $ne: 'Unknown' } } },
      {
        $group: {
          _id: '$aiResult.diseasePrediction',
          count: { $sum: 1 },
          highRisk: { $sum: { $cond: [{ $eq: ['$aiResult.riskLevel', 'High'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json({ diseaseStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get disease stats' });
  }
};

exports.getVillageStats = async (req, res) => {
  try {
    const villageStats = await Patient.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$village',
          totalPatients: { $sum: 1 },
          highRisk: { $sum: { $cond: [{ $eq: ['$currentRiskLevel', 'High'] }, 1, 0] } },
          mediumRisk: { $sum: { $cond: [{ $eq: ['$currentRiskLevel', 'Medium'] }, 1, 0] } },
          lowRisk: { $sum: { $cond: [{ $eq: ['$currentRiskLevel', 'Low'] }, 1, 0] } }
        }
      },
      { $sort: { highRisk: -1 } }
    ]);
    res.json({ villageStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get village stats' });
  }
};

exports.getWeeklyTrend = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    let days = 30;
    if (timeframe === 'week') days = 7;
    if (timeframe === 'year') days = 365;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const trend = await Screening.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            week: { $isoWeek: '$createdAt' },
            year: { $isoWeekYear: '$createdAt' },
            disease: '$aiResult.diseasePrediction'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);
    res.json({ trend });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get weekly trend' });
  }
};

exports.getDailyScreenings = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    let days = 30;
    if (timeframe === 'week') days = 7;
    if (timeframe === 'year') days = 365;
    
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const daily = await Screening.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          high: { $sum: { $cond: [{ $eq: ['$aiResult.riskLevel', 'High'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$aiResult.riskLevel', 'Medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$aiResult.riskLevel', 'Low'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ daily });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get daily screenings' });
  }
};

exports.detectOutbreak = async (req, res) => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const recentCases = await Screening.aggregate([
      { $match: { createdAt: { $gte: threeDaysAgo } } },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      { $unwind: '$patientInfo' },
      {
        $group: {
          _id: {
            village: '$patientInfo.village',
            disease: '$aiResult.diseasePrediction'
          },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gte: 3 } } },    // ≥3 same disease in same village = outbreak
      { $sort: { count: -1 } }
    ]);

    const outbreaks = recentCases.map(c => ({
      village: c._id.village,
      disease: c._id.disease,
      cases: c.count,
      alert: `⚠️ Possible ${c._id.disease} outbreak in ${c._id.village}: ${c.count} cases in 3 days`
    }));

    res.json({ outbreaks, totalOutbreaks: outbreaks.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to detect outbreaks' });
  }
};

exports.simulateOutbreak = async (req, res) => {
  try {
    const { disease = 'Dengue', village = 'Rampur', count = 8 } = req.body;

    const ashaUsers = await require('../models/User').find({ role: 'asha' }).limit(1);
    if (!ashaUsers.length) return res.status(400).json({ error: 'No ASHA workers found' });

    const villages = await Village.find({ name: new RegExp(village, 'i') }).limit(1);
    const coords = villages[0]?.location?.coordinates || [77.2, 21.1];

    const patients = [];
    const screenings = [];
    for (let i = 0; i < count; i++) {
      const p = await Patient.create({
        name: `Outbreak Patient ${Date.now()}-${i}`,
        age: Math.floor(20 + Math.random() * 40),
        gender: i % 2 === 0 ? 'male' : 'female',
        village,
        symptoms: ['fever', 'headache', 'rash', 'joint pain', 'nausea'],
        registeredBy: ashaUsers[0]._id,
        currentRiskLevel: 'High',
        location: {
          type: 'Point',
          coordinates: [
            coords[0] + (Math.random() - 0.5) * 0.05,
            coords[1] + (Math.random() - 0.5) * 0.05
          ]
        }
      });
      patients.push(p);

      const s = await Screening.create({
        patient: p._id,
        conductedBy: ashaUsers[0]._id,
        symptoms: ['fever', 'headache', 'rash', 'joint pain', 'nausea'],
        vitals: { temperature: 38.5 + Math.random(), pulse: 90 + Math.floor(Math.random() * 20), oxygenLevel: 96 },
        aiResult: {
          diseasePrediction: disease,
          riskLevel: 'High',
          recommendation: 'Refer to PHC immediately',
          confidence: 0.92
        }
      });

      await Patient.findByIdAndUpdate(p._id, { lastScreeningId: s._id });
      screenings.push(s);
    }

    res.json({
      message: `Outbreak simulated: ${count} ${disease} cases in ${village}`,
      patientsCreated: patients.length,
      screeningsCreated: screenings.length
    });
  } catch (err) {
    console.error('Simulate outbreak error:', err);
    res.status(500).json({ error: 'Failed to simulate outbreak' });
  }
};
