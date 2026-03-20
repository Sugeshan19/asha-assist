const router = require('express').Router();
const { getAlerts, acknowledgeAlert, getAlertStats } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('doctor', 'admin'), getAlerts);
router.get('/stats', authorize('doctor', 'admin'), getAlertStats);
router.put('/:id/acknowledge', authorize('doctor', 'admin'), acknowledgeAlert);

module.exports = router;
