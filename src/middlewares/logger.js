const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const writeLog = (level, message) => {
  const logMessage = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}\n`;
  const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage);
  if (process.env.NODE_ENV === 'development') {
    console.log(logMessage.trim());
  }
};

const logger = {
  info: (msg) => writeLog('info', msg),
  warn: (msg) => writeLog('warn', msg),
  error: (msg) => writeLog('error', msg),
  debug: (msg) => writeLog('debug', msg),
};

module.exports = logger;
