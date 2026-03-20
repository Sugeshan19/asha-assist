require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Screening = require('./src/models/Screening');
const Alert = require('./src/models/Alert');
const Village = require('./src/models/Village');

// ── Seed Data ─────────────────────────────────────────────────────

const villages = [
  { name: 'Rampur', district: 'Jabalpur', state: 'Madhya Pradesh', location: { type: 'Point', coordinates: [79.9864, 23.1815] }, population: 1240, phcName: 'PHC Jabalpur Central', phcDistance: 8 },
  { name: 'Sundarlal Nagar', district: 'Jabalpur', state: 'Madhya Pradesh', location: { type: 'Point', coordinates: [80.0200, 23.2100] }, population: 890, phcName: 'PHC Jabalpur North', phcDistance: 12 },
  { name: 'Tikampur', district: 'Sagar', state: 'Madhya Pradesh', location: { type: 'Point', coordinates: [78.7378, 23.8388] }, population: 620, phcName: 'PHC Sagar East', phcDistance: 15 },
  { name: 'Govindpur', district: 'Sagar', state: 'Madhya Pradesh', location: { type: 'Point', coordinates: [78.8000, 23.8900] }, population: 780, phcName: 'PHC Sagar East', phcDistance: 18 },
  { name: 'Krishnanagar', district: 'Bhopal', state: 'Madhya Pradesh', location: { type: 'Point', coordinates: [77.4126, 23.2599] }, population: 1100, phcName: 'PHC Bhopal South', phcDistance: 5 },
  { name: 'Shivpur', district: 'Rewa', state: 'Madhya Pradesh', location: { type: 'Point', coordinates: [81.2963, 24.5362] }, population: 430, phcName: 'PHC Rewa Central', phcDistance: 22 }
];

const users = [
  { name: 'Dr. Priya Sharma', email: 'doctor@asha.com', password: 'Doctor@123', role: 'doctor', phone: '+919876543210', village: 'Jabalpur' },
  { name: 'Dr. Rajeev Kumar', email: 'doctor2@asha.com', password: 'Doctor@123', role: 'doctor', phone: '+919876543211', village: 'Bhopal' },
  { name: 'Sunita Patel', email: 'asha@asha.com', password: 'Asha@1234', role: 'asha', phone: '+918765432100', village: 'Rampur' },
  { name: 'Meena Devi', email: 'asha2@asha.com', password: 'Asha@1234', role: 'asha', phone: '+918765432101', village: 'Tikampur' },
  { name: 'Kamla Bai', email: 'asha3@asha.com', password: 'Asha@1234', role: 'asha', phone: '+918765432102', village: 'Krishnanagar' },
  { name: 'Admin User', email: 'admin@asha.com', password: 'Admin@123', role: 'admin', phone: '+919999999999', village: 'Bhopal' }
];

const symptomSets = {
  Dengue: ['fever', 'severe headache', 'pain behind eyes', 'joint pain', 'muscle pain', 'rash', 'nausea', 'vomiting'],
  Malaria: ['fever', 'chills', 'sweating', 'headache', 'body ache', 'nausea', 'vomiting', 'fatigue'],
  Tuberculosis: ['persistent cough', 'coughing blood', 'chest pain', 'weight loss', 'night sweats', 'fatigue', 'fever'],
  Anemia: ['fatigue', 'weakness', 'pale skin', 'shortness of breath', 'dizziness', 'cold hands', 'headache'],
  'Respiratory Infection': ['cough', 'sore throat', 'runny nose', 'fever', 'difficulty breathing', 'chest tightness'],
  Typhoid: ['high fever', 'abdominal pain', 'headache', 'diarrhea', 'fatigue', 'loss of appetite', 'rash'],
  Unknown: ['fever', 'body ache', 'fatigue']
};

const riskByDisease = {
  Dengue: 'High',
  Malaria: 'High',
  Tuberculosis: 'Medium',
  Anemia: 'Medium',
  'Respiratory Infection': 'Low',
  Typhoid: 'High',
  Unknown: 'Low'
};

const patients = [
  { name: 'Ramesh Kumar', age: 34, gender: 'male', village: 'Rampur', disease: 'Dengue' },
  { name: 'Sita Devi', age: 28, gender: 'female', village: 'Rampur', disease: 'Malaria' },
  { name: 'Anil Yadav', age: 45, gender: 'male', village: 'Rampur', disease: 'Tuberculosis' },
  { name: 'Geeta Bai', age: 22, gender: 'female', village: 'Sundarlal Nagar', disease: 'Anemia' },
  { name: 'Mohan Lal', age: 55, gender: 'male', village: 'Sundarlal Nagar', disease: 'Dengue' },
  { name: 'Poonam Sharma', age: 30, gender: 'female', village: 'Sundarlal Nagar', disease: 'Respiratory Infection' },
  { name: 'Vikram Singh', age: 40, gender: 'male', village: 'Tikampur', disease: 'Malaria' },
  { name: 'Kamla Devi', age: 60, gender: 'female', village: 'Tikampur', disease: 'Anemia' },
  { name: 'Raju Patel', age: 18, gender: 'male', village: 'Tikampur', disease: 'Typhoid' },
  { name: 'Savitri Bai', age: 35, gender: 'female', village: 'Govindpur', disease: 'Dengue' },
  { name: 'Harish Kumar', age: 50, gender: 'male', village: 'Govindpur', disease: 'Tuberculosis' },
  { name: 'Rekha Verma', age: 25, gender: 'female', village: 'Krishnanagar', disease: 'Respiratory Infection' },
  { name: 'Suresh Gupta', age: 42, gender: 'male', village: 'Krishnanagar', disease: 'Dengue' },
  { name: 'Leela Patel', age: 38, gender: 'female', village: 'Krishnanagar', disease: 'Malaria' },
  { name: 'Bablu Mishra', age: 12, gender: 'male', village: 'Shivpur', disease: 'Dengue' },
  { name: 'Radha Kumari', age: 20, gender: 'female', village: 'Shivpur', disease: 'Anemia' },
  { name: 'Prakash Rao', age: 65, gender: 'male', village: 'Rampur', disease: 'Tuberculosis' },
  { name: 'Champa Devi', age: 44, gender: 'female', village: 'Rampur', disease: 'Dengue' },
  { name: 'Dinesh Tiwari', age: 33, gender: 'male', village: 'Sundarlal Nagar', disease: 'Typhoid' },
  { name: 'Uma Shankar', age: 29, gender: 'female', village: 'Tikampur', disease: 'Dengue' }
];

const vitalsForDisease = (disease) => {
  const base = {
    Dengue: { temperature: 39.2, pulse: 98, oxygenLevel: 97, bloodPressureSystolic: 110, bloodPressureDiastolic: 70 },
    Malaria: { temperature: 40.1, pulse: 105, oxygenLevel: 96, bloodPressureSystolic: 105, bloodPressureDiastolic: 65 },
    Tuberculosis: { temperature: 37.8, pulse: 90, oxygenLevel: 94, bloodPressureSystolic: 115, bloodPressureDiastolic: 75 },
    Anemia: { temperature: 37.2, pulse: 110, oxygenLevel: 92, bloodPressureSystolic: 100, bloodPressureDiastolic: 60 },
    'Respiratory Infection': { temperature: 38.5, pulse: 88, oxygenLevel: 95, bloodPressureSystolic: 120, bloodPressureDiastolic: 80 },
    Typhoid: { temperature: 40.5, pulse: 100, oxygenLevel: 97, bloodPressureSystolic: 108, bloodPressureDiastolic: 68 },
    Unknown: { temperature: 37.5, pulse: 80, oxygenLevel: 98, bloodPressureSystolic: 120, bloodPressureDiastolic: 80 }
  };
  const v = base[disease] || base.Unknown;
  return {
    temperature: v.temperature + (Math.random() - 0.5) * 0.6,
    pulse: v.pulse + Math.floor((Math.random() - 0.5) * 10),
    oxygenLevel: v.oxygenLevel,
    bloodPressureSystolic: v.bloodPressureSystolic,
    bloodPressureDiastolic: v.bloodPressureDiastolic,
    weight: 50 + Math.floor(Math.random() * 30)
  };
};

const recommendations = {
  High: 'Refer to PHC immediately. Do not delay treatment.',
  Medium: 'Visit nearest health center within 24 hours.',
  Low: 'Monitor at home. Ensure rest and hydration. Follow up in 3 days.'
};

async function seed(customUri) {
  const uri = customUri || process.env.MONGO_URI || 'mongodb://localhost:27017/asha_assist';
  const isDirectRun = require.main === module;
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB for seeding');
    }
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Screening.deleteMany({}),
      Alert.deleteMany({}),
      Village.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create villages
    const createdVillages = await Village.insertMany(villages);
    console.log(`🏘️  Created ${createdVillages.length} villages`);

    // Create users
    const createdUsers = [];
    for (const u of users) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} users`);

    const ashaWorkers = createdUsers.filter(u => u.role === 'asha');
    const villageMap = {};
    createdVillages.forEach(v => { villageMap[v.name] = v; });

    // Create patients with screenings
    let patientCount = 0;
    let screeningCount = 0;
    let alertCount = 0;

    for (const pd of patients) {
      const asha = ashaWorkers.find(a => a.village === pd.village) || ashaWorkers[0];
      const villageData = villageMap[pd.village];
      const coords = villageData ? [
        villageData.location.coordinates[0] + (Math.random() - 0.5) * 0.04,
        villageData.location.coordinates[1] + (Math.random() - 0.5) * 0.04
      ] : [79.98, 23.18];

      const symptoms = symptomSets[pd.disease] || symptomSets.Unknown;
      const riskLevel = riskByDisease[pd.disease] || 'Low';
      const vitals = vitalsForDisease(pd.disease);

      // Create screening first to get ID
      const daysAgo = Math.floor(Math.random() * 14);
      const screeningDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const screening = new Screening({
        patient: new mongoose.Types.ObjectId(),   // placeholder
        conductedBy: asha._id,
        symptoms,
        vitals,
        inputMethod: 'form',
        aiResult: {
          diseasePrediction: pd.disease,
          riskLevel,
          recommendation: recommendations[riskLevel],
          confidence: 0.75 + Math.random() * 0.22,
          differentials: Object.keys(symptomSets)
            .filter(d => d !== pd.disease)
            .slice(0, 2)
            .map(d => ({ disease: d, probability: Math.random() * 0.2 }))
        },
        createdAt: screeningDate
      });

      const patient = new Patient({
        name: pd.name,
        age: pd.age,
        gender: pd.gender,
        village: pd.village,
        district: villageData?.district || 'Jabalpur',
        state: 'Madhya Pradesh',
        symptoms,
        location: { type: 'Point', coordinates: coords },
        registeredBy: asha._id,
        currentRiskLevel: riskLevel,
        lastScreeningId: screening._id,
        vitals: [{ ...vitals, recordedAt: screeningDate }],
        createdAt: new Date(screeningDate.getTime() - 60000)
      });

      await patient.save();
      screening.patient = patient._id;
      await screening.save();

      // Create alert for high-risk
      if (riskLevel === 'High') {
        const doctor = createdUsers.find(u => u.role === 'doctor');
        const alert = await Alert.create({
          patient: patient._id,
          screening: screening._id,
          alertedBy: asha._id,
          alertedDoctor: doctor?._id,
          alertType: 'sms',
          message: `[ASHA Assist] HIGH RISK ALERT: Patient ${pd.name} from ${pd.village} village has possible ${pd.disease}. Risk Level: High. Please review immediately.`,
          recipientPhone: doctor?.phone,
          riskLevel: 'High',
          disease: pd.disease,
          village: pd.village,
          twilioSid: `MOCK_SEED_${Date.now()}_${patientCount}`,
          status: daysAgo > 2 ? 'acknowledged' : 'sent',
          createdAt: screeningDate
        });
        await Screening.findByIdAndUpdate(screening._id, { alertSent: true, alertId: alert._id });
        alertCount++;
      }

      patientCount++;
      screeningCount++;
    }

    // Update village stats
    for (const v of createdVillages) {
      const total = await Patient.countDocuments({ village: v.name });
      const high = await Patient.countDocuments({ village: v.name, currentRiskLevel: 'High' });
      await Village.findByIdAndUpdate(v._id, {
        'stats.totalPatients': total,
        'stats.highRiskCount': high,
        'stats.activeCases': total,
        'stats.lastUpdated': new Date()
      });
    }

    console.log(`🏥 Created ${patientCount} patients`);
    console.log(`🔬 Created ${screeningCount} screenings`);
    console.log(`🚨 Created ${alertCount} alerts`);
    console.log('\n✅ SEED COMPLETE — Login credentials:');
    console.log('  Doctor  → doctor@asha.com  / Doctor@123');
    console.log('  ASHA    → asha@asha.com    / Asha@1234');
    console.log('  Admin   → admin@asha.com   / Admin@123');

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    if (isDirectRun) {
      await mongoose.disconnect();
      process.exit(0);
    }
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
