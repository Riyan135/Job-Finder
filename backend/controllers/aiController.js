const express = require('express');

// Mock Data for AI Features
const mockResumeAnalysis = {
  score: 75,
  atsCompatibility: 'Medium',
  missingSections: ['Certifications', 'Projects'],
  suggestions: [
    'Add more quantifiable achievements in your experience section.',
    'Include a dedicated section for technical certifications.',
    'Optimize keywords based on the job description.'
  ]
};

const mockLearningRoadmap = {
  missingSkill: 'React.js',
  estimatedCompletion: '4 Weeks',
  resources: [
    { title: 'React Crash Course 2026', type: 'YouTube', link: '#' },
    { title: 'Advanced React Patterns', type: 'Course', link: '#' },
    { title: 'Official React Documentation', type: 'Docs', link: 'https://reactjs.org' }
  ]
};

// @desc    Analyze uploaded resume
// @route   POST /api/ai/analyze-resume
// @access  Private (Job Seeker)
exports.analyzeResume = async (req, res) => {
  try {
    // In a real app, we would send the parsed resume text to OpenAI/Gemini here.
    // For now, we return mock AI data.
    res.status(200).json({
      success: true,
      data: mockResumeAnalysis
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'AI Analysis Failed' });
  }
};

// @desc    Get learning recommendations for missing skills
// @route   POST /api/ai/recommend-learning
// @access  Private
exports.recommendLearning = async (req, res) => {
  try {
    const { skills } = req.body; // Array of missing skills
    
    // In a real app, generate roadmap via LLM for the provided skills
    res.status(200).json({
      success: true,
      data: mockLearningRoadmap
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'AI Recommendation Failed' });
  }
};

// @desc    Career guidance chatbot
// @route   POST /api/ai/chat
// @access  Private
exports.chatbot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message'
      });
    }

    // Mock chatbot responses based on keyword matching
    const lowerMessage = message.toLowerCase();
    let reply;

    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      reply =
        'Here are some tips for your resume:\n' +
        '1. Keep it concise — ideally 1-2 pages.\n' +
        '2. Tailor it to each job description.\n' +
        '3. Use quantifiable achievements (e.g., "Increased sales by 20%").\n' +
        '4. Include a strong summary section at the top.\n' +
        '5. Use our AI Resume Analyzer for a detailed review!';
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
      reply =
        'To bridge skill gaps effectively:\n' +
        '1. Identify in-demand skills from job postings in your field.\n' +
        '2. Take online courses on platforms like Coursera, Udemy, or freeCodeCamp.\n' +
        '3. Build projects to demonstrate your new skills.\n' +
        '4. Earn certifications to validate your expertise.\n' +
        '5. Use our Learning Roadmap feature for personalized recommendations!';
    } else if (lowerMessage.includes('interview')) {
      reply =
        'Interview preparation tips:\n' +
        '1. Research the company thoroughly before the interview.\n' +
        '2. Practice the STAR method for behavioral questions.\n' +
        '3. Prepare 3-5 questions to ask the interviewer.\n' +
        '4. Do mock interviews with friends or online tools.\n' +
        '5. Follow up with a thank-you email within 24 hours.';
    } else if (lowerMessage.includes('salary') || lowerMessage.includes('negotiat')) {
      reply =
        'Salary negotiation advice:\n' +
        '1. Research market rates on Glassdoor, Payscale, or LinkedIn Salary.\n' +
        '2. Know your minimum acceptable salary before negotiating.\n' +
        '3. Let the employer make the first offer when possible.\n' +
        '4. Consider the full compensation package (benefits, equity, flexibility).\n' +
        '5. Practice your negotiation pitch beforehand.';
    } else if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
      reply =
        'General career guidance:\n' +
        '1. Define your career goals — short-term and long-term.\n' +
        '2. Network actively on LinkedIn and at industry events.\n' +
        '3. Keep your profile and resume updated at all times.\n' +
        '4. Consider mentorship to accelerate your growth.\n' +
        '5. Apply consistently and track your applications!';
    } else {
      reply =
        "I'm your career guidance assistant! I can help with:\n" +
        '• Resume & CV tips\n' +
        '• Skill development & learning paths\n' +
        '• Interview preparation\n' +
        '• Salary negotiation\n' +
        '• General career advice\n\n' +
        'Try asking me about any of these topics!';
    }

    res.status(200).json({
      success: true,
      data: {
        userMessage: message,
        botReply: reply,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Chatbot service failed' });
  }
};
