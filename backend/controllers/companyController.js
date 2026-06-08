const crypto = require('crypto');
const Company = require('../models/Company');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/email');

// @desc    Register company (send OTP)
// @route   POST /api/companies/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, industry, email, website, location, hrContact, password } = req.body;
    // Create company (no verification yet)
    const company = await Company.create({ name, industry, email, website, location, hrContact, password });
    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    company.verificationOTP = otp;
    company.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await company.save({ validateBeforeSave: false });
    // Send email (simple text)
    await sendEmail({
      to: email,
      subject: 'Company Email Verification OTP',
      text: `Your verification code is ${otp}. It expires in 10 minutes.`
    });
    res.status(200).json({ success: true, data: { email } });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP
// @route   POST /api/companies/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const company = await Company.findOne({ email });
    if (!company) return next(new ErrorResponse('Company not found', 404));
    if (company.isVerified) return res.status(400).json({ success: false, error: 'Already verified' });
    if (company.verificationOTP !== otp || Date.now() > company.otpExpires) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    company.isVerified = true;
    company.verificationOTP = undefined;
    company.otpExpires = undefined;
    await company.save();
    res.status(200).json({ success: true, data: 'Company verified' });
  } catch (err) {
    next(err);
  }
};

// @desc    Login company
// @route   POST /api/companies/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email }).select('+password');
    if (!company) return next(new ErrorResponse('Invalid credentials', 401));
    if (!company.isVerified) return res.status(403).json({ success: false, error: 'Account not verified' });
    const isMatch = await company.comparePassword(password);
    if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));
    const token = company.getSignedJwtToken();
    res.status(200).json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current company profile
// @route   GET /api/companies/me
// @access  Private (company)
exports.getProfile = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.id).select('-password -verificationOTP -otpExpires');
    res.status(200).json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
};

// @desc    Update company profile
// @route   PUT /api/companies/me
// @access  Private (company)
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const company = await Company.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password -verificationOTP -otpExpires');
    res.status(200).json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
};
