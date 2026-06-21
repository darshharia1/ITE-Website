// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { json, urlencoded } = require('express');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));

// API routes
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);
const startupsRouter = require('./routes/startups');
app.use('/api/startups', startupsRouter);
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
