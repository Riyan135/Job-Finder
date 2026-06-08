const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio can not be more than 500 characters']
  },
  education: [
    {
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      field: { type: String },
      startYear: { type: Number },
      endYear: { type: Number }
    }
  ],
  skills: {
    type: [String],
    default: []
  },
  experience: [
    {
      company: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String },
      startDate: { type: Date },
      endDate: { type: Date }
    }
  ],
  certifications: [
    {
      name: { type: String, required: true },
      issuer: { type: String },
      year: { type: Number }
    }
  ],
  resumeUrl: {
    type: String
  },
  savedJobs: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Job'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
