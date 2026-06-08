const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  resumeUrl: {
    type: String, // Path to uploaded resume
    required: false 
  },
  // Form fields
  fullName: { type: String, required: false },
  email: { type: String, required: false },
  mobile: { type: String, required: false },
  location: { type: String, required: false },
  qualification: { type: String, required: false },
  experience: { type: String, required: false },
  currentSalary: { type: String, required: false },
  expectedSalary: { type: String, required: false },
  noticePeriod: { type: String, required: false },
  coverLetter: { type: String, required: false },

  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  atsScore: {
    type: Number,
    default: 0
  },
  skillMatchPercentage: {
    type: Number,
    default: 0
  },
  missingSkills: {
    type: [String],
    default: []
  },
  
  // Interview Details
  interviewDate: { type: Date },
  interviewTime: { type: String },
  interviewMode: { type: String, enum: ['Online', 'Offline', 'Phone Call'] },
  interviewLink: { type: String },
  interviewLocation: { type: String },
  interviewInstructions: { type: String },

  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);
