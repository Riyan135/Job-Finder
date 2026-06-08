const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  interviewId: { type: String, required: true, unique: true }, // unique ID
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  candidatePhone: { type: String, required: true },
  appliedPosition: { type: String, required: true },
  interviewType: { type: String, enum: ['Online', 'Offline', 'Telephonic'], required: true },
  interviewRound: { type: String, enum: ['HR Round', 'Technical Round', 'Managerial Round', 'Final Round'], required: true },
  interviewDate: { type: Date, required: true },
  interviewTime: { type: String, required: true }, // e.g., '14:30'
  duration: { type: String, required: true }, // e.g., '30 min'
  timeZone: { type: String, required: true },
  interviewerName: { type: String, required: true },
  interviewerEmail: { type: String, required: true },
  department: { type: String, required: true },
  meetingLink: { type: String }, // for online
  officeAddress: { type: String }, // for offline
  meetingPlatform: { type: String }, // optional platform name
  notesForCandidate: { type: String },
  internalRemarks: { type: String },
  requiredDocsChecklist: { type: [String] },
  status: { type: String, enum: ['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', InterviewSchema);
