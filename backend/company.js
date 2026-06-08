// Centralized Company module for easy editing
// This file aggregates all company‑related controllers and routes.
// You can edit any company logic here without touching multiple files.

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const Job = require('./models/Job');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('./utils/email');

// ---------- Helper Functions ----------
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function protect(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Try to find a User or Company
    const User = require('./models/User');
    Promise.all([User.findById(decoded.id), Company.findById(decoded.id)])
      .then(([user, company]) => {
        req.user = user || company;
        if (!req.user) return res.status(401).json({ success: false, error: 'User not found' });
        next();
      })
      .catch(() => res.status(401).json({ success: false, error: 'Not authorized' }));
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Role ${req.user.role} not authorized` });
    }
    next();
  };
}

// ---------- Company Auth ----------
router.post('/register', async (req, res) => {
  try {
    const { name, industry, email, website, location, hrContact, password } = req.body;
    const company = await Company.create({ name, industry, email, website, location, hrContact, password });
    const otp = generateOTP();
    company.verificationOTP = otp;
    company.otpExpires = Date.now() + 10 * 60 * 1000;
    await company.save({ validateBeforeSave: false });
    await sendEmail({ to: email, subject: 'Company OTP Verification', text: `Your code: ${otp}` });
    res.status(201).json({ success: true, data: { email, otp } });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ success: false, error: 'A company with this name or email already exists.' });
    }
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const company = await Company.findOne({ email, verificationOTP: otp, otpExpires: { $gt: Date.now() } });
  if (!company) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
  company.isVerified = true;
  company.verificationOTP = undefined;
  company.otpExpires = undefined;
  await company.save();
  const token = company.getSignedJwtToken();
  res.status(200).json({ success: true, token, user: { id: company._id, name: company.name, email: company.email, role: 'company' } });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database unavailable. Please start MongoDB and try again.' });
    }

    const company = await Company.findOne({ email }).select('+password');
    if (!company) return res.status(400).json({ success: false, error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid credentials' });
    if (!company.isVerified) return res.status(403).json({ success: false, error: 'Not verified' });
    const token = company.getSignedJwtToken();
    return res.status(200).json({ success: true, token, user: { id: company._id, name: company.name, email: company.email, role: 'company' } });
  } catch (err) {
    // Fallback for when DB is unavailable – return a mock token for any credentials
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to login company' });
  }
});

router.get('/me', protect, authorize('company'), async (req, res) => {
  const company = await Company.findById(req.user.id).select('-password -verificationOTP -otpExpires');
  res.status(200).json({ success: true, data: company });
});

router.put('/me', protect, authorize('company'), async (req, res) => {
  const updates = req.body;
  const company = await Company.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true })
    .select('-password -verificationOTP -otpExpires');
  res.status(200).json({ success: true, data: company });
});

// ---------- Job Management (Company) ----------
router.post('/jobs', protect, authorize('company'), async (req, res) => {
  try {
    const jobData = { ...req.body, company: req.user.id, status: 'Active', isApproved: true };
    const job = await Job.create(jobData);
    res.status(201).json({ success: true, data: job });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/jobs', protect, authorize('company'), async (req, res) => {
  const jobs = await Job.find({ company: req.user.id });
  res.status(200).json({ success: true, count: jobs.length, data: jobs });
});

router.put('/jobs/:id', protect, authorize('company'), async (req, res) => {
  const job = await Job.findOneAndUpdate({ _id: req.params.id, company: req.user.id }, req.body, { new: true, runValidators: true });
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  res.status(200).json({ success: true, data: job });
});

router.delete('/jobs/:id', protect, authorize('company'), async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, company: req.user.id });
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  res.status(200).json({ success: true, data: {} });
});

module.exports = router;
