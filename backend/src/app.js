// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { json, urlencoded } = require('express');
const { authRateLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS configurations restricted to FRONTEND_URL
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};

// Global Middlewares
app.use(cors(corsOptions));
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));

// Rate limit authentication routes
app.use('/api/auth', authRateLimiter);

// Serve frontend static files safely
const path = require('path');
const fs = require('fs');
const frontendDir = path.resolve(__dirname, '..', '..');

app.use('/css', express.static(path.join(frontendDir, 'css')));
app.use('/js', express.static(path.join(frontendDir, 'js')));
app.use('/assets', express.static(path.join(frontendDir, 'assets')));

app.get('/acm-chapter.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  fs.createReadStream(path.join(frontendDir, 'acm-chapter.html')).pipe(res);
});

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  fs.createReadStream(path.join(frontendDir, 'index.html')).pipe(res);
});

app.get('/index.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  fs.createReadStream(path.join(frontendDir, 'index.html')).pipe(res);
});

// API routes
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);
const startupsRouter = require('./routes/startups');
app.use('/api/startups', startupsRouter);
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
const teamsRouter = require('./routes/teams');
app.use('/api/teams', teamsRouter);
const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);
const announcementsRouter = require('./routes/announcements');
app.use('/api/announcements', announcementsRouter);
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);
const mentorRouter = require('./routes/mentor');
app.use('/api/mentor', mentorRouter);

// Simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handler mounted after all routes
app.use(errorHandler);

module.exports = app;
