const router = require('express').Router();
const { body } = require('express-validator');
const {
  register, login, sendOtp, verifyOtp,
  getMe, updateProfile, listUsers,
  registerWithPhone // Added registerWithPhone
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Email/password register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['asha', 'doctor', 'admin'])
], register);

// Email/password login
router.post('/login', login);

// OTP-based login
router.post('/send-otp', [
  body('phone').notEmpty().withMessage('Phone number required')
], sendOtp);

router.post('/verify-otp', [
  body('phone').notEmpty().withMessage('Phone required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], verifyOtp);

router.post('/register-with-phone', registerWithPhone);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, authorize('admin', 'doctor'), listUsers);

module.exports = router;
