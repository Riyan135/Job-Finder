const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

let dbReady;
const ensureDB = () => {
  if (!dbReady) {
    dbReady = connectDB();
  }
  return dbReady;
};

app.use('/api', async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    res.status(503).json({ success: false, error: 'Database unavailable' });
  }
});

// Route files
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const aiRoutes = require('./routes/aiRoutes');
const companyRoutes = require('./company');
const profileRoutes = require('./routes/profileRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
const notificationRoutes = require('./routes/notificationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
app.use('/api/interviews', interviewRoutes);

// Keep API failures JSON-shaped so frontend fetch handlers never receive
// Express's default HTML error page.
app.use('/api', (err, req, res, next) => {
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON request body' });
  }

  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: status === 500 ? 'Internal server error' : err.message,
  });
});

// Serve Chrome DevTools config file for local development
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({});
});



// Create uploads directory for resume uploads if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'resumes');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn(`Warning: unable to create uploads directory (${err.message}).`);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await ensureDB();
  } catch (err) {
    console.warn('MongoDB connection failed, starting server without DB.');
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB optional)`));
};

if (require.main === module) {
  startServer();
}

module.exports = app;
