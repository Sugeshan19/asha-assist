// OTP Auth Controller – mock OTP store (in-memory; replace with Redis/Twilio in production)
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// In-memory OTP store: phone -> { otp, expiresAt, attempts }
const otpStore = new Map();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  village: user.village,
  district: user.district,
  assignedVillages: user.assignedVillages,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt
});

// ------ REGISTER ------
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, role, phone, village, district } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, error: 'User with this email already exists' });

    const user = await User.create({ name, email, password, role, phone, village, district });
    const token = signToken(user._id);

    res.status(201).json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

// ------ LOGIN (email/password) ------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, error: 'Account is deactivated. Contact admin.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// ------ SEND OTP ------
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });

    // Normalize phone
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (normalizedPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    const user = await User.findOne({ phone: { $in: [phone, normalizedPhone, `+91${normalizedPhone}`] } });
    if (user && !user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    // Check rate limit: max 3 OTPs per 10 minutes
    const existing = otpStore.get(normalizedPhone);
    if (existing && existing.attempts >= 3 && Date.now() < existing.lockedUntil) {
      const waitSecs = Math.ceil((existing.lockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        error: `Too many OTP requests. Try again in ${waitSecs} seconds.`
      });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const prevAttempts = (existing && Date.now() < existing.windowEnd) ? existing.attempts : 0;
    const windowEnd = (existing && Date.now() < existing.windowEnd) ? existing.windowEnd : Date.now() + 10 * 60 * 1000;
    const newAttempts = prevAttempts + 1;

    otpStore.set(normalizedPhone, {
      otp,
      expiresAt,
      attempts: newAttempts,
      windowEnd,
      lockedUntil: newAttempts >= 3 ? Date.now() + 10 * 60 * 1000 : 0,
      userId: user ? user._id.toString() : null,
      phone: normalizedPhone
    });

    // In production: Send via Twilio or MSG91
    // await twilioClient.messages.create({ body: `Your ASHA Assist OTP is: ${otp}. Valid for 5 minutes.`, from: '...', to: phone });

    console.log(`[OTP] Phone: ${normalizedPhone}, OTP: ${otp} (demo - not sent via SMS)`);

    res.json({
      success: true,
      message: `OTP sent to +91 ****${normalizedPhone.slice(-4)}`,
      // DEMO ONLY – remove in production
      demo_otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      expiresIn: 300 // seconds
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

// ------ VERIFY OTP ------
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, error: 'Phone and OTP are required' });

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    const stored = otpStore.get(normalizedPhone);

    if (!stored) return res.status(400).json({ success: false, error: 'No OTP requested for this number. Please request again.' });
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedPhone);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }
    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Incorrect OTP. Please check and try again.' });
    }

    // OTP verified – clean up
    otpStore.delete(normalizedPhone);

    if (stored.userId) {
      // Existing User
      const user = await User.findById(stored.userId);
      if (!user || !user.isActive) return res.status(403).json({ success: false, error: 'Account not accessible' });

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const token = signToken(user._id);
      res.json({ success: true, token, user: formatUser(user) });
    } else {
      // New User Flow
      const tempToken = jwt.sign({ phone: normalizedPhone }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, isNewUser: true, tempToken, phone: normalizedPhone });
    }
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, error: 'OTP verification failed' });
  }
};

// ------ REGISTER WITH PHONE (After OTP) ------
exports.registerWithPhone = async (req, res) => {
  try {
    const { tempToken, name, role, village, district } = req.body;
    if (!tempToken || !name || !role) {
      return res.status(400).json({ success: false, error: 'Missing required registration info' });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.phone) return res.status(401).json({ success: false, error: 'Invalid temp token' });

    const phone = `+91${decoded.phone}`;
    const existing = await User.findOne({ phone });
    if (existing) return res.status(409).json({ success: false, error: 'User already registered' });

    const user = await User.create({
      name,
      email: `${decoded.phone}@asha.com`, // dummy email for schema
      password: await require('bcryptjs').hash(Math.random().toString(36), 10), // dummy password
      role,
      phone,
      village: village || 'Unknown',
      district: district || 'Unknown'
    });

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    console.error('Phone Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

// ------ GET ME ------
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

// ------ UPDATE PROFILE ------
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, village, district } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, village, district },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Profile update failed' });
  }
};

// ------ LIST USERS (admin) ------
exports.listUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, users: users.map(formatUser) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to list users' });
  }
};
