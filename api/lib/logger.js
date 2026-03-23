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

function getTimestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (msg, ...args) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.info}INFO${colors.reset}: ${msg}`, ...args);
  },
  success: (msg, ...args) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.success}SUCCESS${colors.reset}: ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.warn}WARN${colors.reset}: ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.error}ERROR${colors.reset}: ${msg}`, ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.debug}DEBUG${colors.reset}: ${msg}`, ...args);
    }
  },
};

export default logger;
