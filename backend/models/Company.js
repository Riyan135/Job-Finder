const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a company name'], unique: true },
  industry: { type: String },
  email: { type: String, required: [true, 'Please add an email'], unique: true, match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'] },
  website: { type: String },
  logo: { type: String }, // path to uploaded logo image
  location: { type: String },
  hrContact: { type: String },
  password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false },
  isVerified: { type: Boolean, default: false }, // set after OTP verification
  verificationOTP: { type: String },
  otpExpires: { type: Date },
  role: { type: String, default: 'company' }, // for auth middleware
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
CompanySchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT for company
CompanySchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

module.exports = mongoose.model('Company', CompanySchema);
