const router = require('express').Router();
const {
  createScreening, getScreeningsByPatient, getScreeningById,
  doctorReview, getRecentScreenings
} = require('../controllers/screeningController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getRecentScreenings);
router.post('/', createScreening);
router.get('/patient/:patientId', getScreeningsByPatient);
router.get('/:id', getScreeningById);
router.put('/:id/review', authorize('doctor', 'admin'), doctorReview);

module.exports = router;
