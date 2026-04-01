const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  info: '\x1b[36m', // Cyan
  success: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  debug: '\x1b[90m', // Gray
};

import { traceStorage } from './middleware/trace.js';

function getTimestamp() {
  return new Date().toISOString();
}

function formatMsg(msg) {
  const reqId = traceStorage.getStore();
  const idPrefix = reqId ? `[${reqId.slice(0, 8)}] ` : '';
  return `${idPrefix}${msg}`;
}

const logger = {
  info: (msg, ...args) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.info}INFO${colors.reset}: ${formatMsg(msg)}`, ...args);
  },
  success: (msg, ...args) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.success}SUCCESS${colors.reset}: ${formatMsg(msg)}`, ...args);
  },
  warn: (msg, ...args) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.warn}WARN${colors.reset}: ${formatMsg(msg)}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.error}ERROR${colors.reset}: ${formatMsg(msg)}`, ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.debug}DEBUG${colors.reset}: ${formatMsg(msg)}`, ...args);
    }
  },
};

export default logger;
