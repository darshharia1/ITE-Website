// src/server.js
require('./config/env'); // Validates required environment variables on boot
const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`🚀 Server listening on port ${PORT}`);
});
