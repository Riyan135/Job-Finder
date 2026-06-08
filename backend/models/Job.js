const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true
    },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  requiredSkills: {
    type: [String],
    required: true
  },
  salary: {
    type: Number,
    required: false
  },
  employer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Closed'],
    default: 'Active'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  jobType: {
    type: String
  },
  qualification: {
    type: String
  },
  experience: {
    type: String
  },
  salaryRange: {
    type: String
  },
  vacancies: {
    type: Number
  },
  deadline: {
    type: Date
  },
  additional: {
    type: String
  },
  benefits: {
    type: String
  }
});

module.exports = mongoose.model('Job', JobSchema);
