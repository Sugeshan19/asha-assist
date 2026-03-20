const router = require('express').Router();
const {
  createPatient, getPatients, getPatientById,
  updatePatient, getPatientsByVillage, getHighRiskPatients, getMapPatients, addDoctorReview
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getPatients);
router.post('/', createPatient);
router.get('/high-risk', authorize('doctor', 'admin'), getHighRiskPatients);
router.get('/map', getMapPatients);
router.get('/village/:village', getPatientsByVillage);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.post('/:id/review', authorize('doctor', 'admin'), addDoctorReview);

module.exports = router;
