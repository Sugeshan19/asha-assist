const router = require('express').Router();
const {
  getSummary, getDiseaseStats, getVillageStats,
  getWeeklyTrend, getDailyScreenings, detectOutbreak, simulateOutbreak
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getSummary);
router.get('/diseases', getDiseaseStats);
router.get('/villages', getVillageStats);
router.get('/weekly-trend', authorize('doctor', 'admin'), getWeeklyTrend);
router.get('/daily', getDailyScreenings);
router.get('/outbreak-detection', authorize('doctor', 'admin'), detectOutbreak);
router.post('/simulate-outbreak', authorize('admin', 'doctor'), simulateOutbreak);

module.exports = router;
