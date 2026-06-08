const crypto = require('crypto');
const Company = require('../models/Company');
const sendEmail = require('../utils/email');

// Helper: generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// @desc    Register a new company
// @route   POST /api/company/auth/register
// @access  Public
exports.registerCompany = async (req, res) => {
  try {
    const { name, industry, email, website, location, hrContact, password } = req.body;
    // Create company (password will be hashed by pre-save hook)
    const company = await Company.create({ name, industry, email, website, location, hrContact, password });

    // Generate OTP and expiry (10 minutes)
    const otp = generateOTP();
    company.verificationOTP = otp;
    company.otpExpires = Date.now() + 10 * 60 * 1000;
    await company.save({ validateBeforeSave: false });

    // Send OTP email
    const message = `Your JobFinder verification code is: ${otp}`;
    await sendEmail({ to: email, subject: 'JobFinder Company Verification OTP', text: message });

    res.status(201).json({ success: true, data: { id: company._id, message: 'OTP sent to email' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Verify company email OTP
// @route   POST /api/company/auth/verify-otp
// @access  Public
exports.verifyCompanyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const company = await Company.findOne({ email, verificationOTP: otp, otpExpires: { $gt: Date.now() } });
    if (!company) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    company.isVerified = true;
    company.verificationOTP = undefined;
    company.otpExpires = undefined;
    await company.save();
    res.status(200).json({ success: true, data: { token: company.getSignedJwtToken(), message: 'Company verified' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Login company
// @route   POST /api/company/auth/login
// @access  Public
exports.loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Include password in query
    const company = await Company.findOne({ email }).select('+password');
    if (!company) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
    // Check password
    const isMatch = await company.comparePassword ? await company.comparePassword(password) : await require('bcrypt').compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
    if (!company.isVerified) {
      return res.status(403).json({ success: false, error: 'Company not verified' });
    }
    const token = company.getSignedJwtToken();
    res.status(200).json({ success: true, token, data: { id: company._id, name: company.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
