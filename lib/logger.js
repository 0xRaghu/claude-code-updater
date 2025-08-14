const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class Logger {
  constructor() {
    this.logDir = path.join(os.homedir(), '.claude-code-updater');
    this.logFile = path.join(this.logDir, 'updater.log');
    this.debugMode = process.env.CLAUDE_UPDATER_DEBUG === 'true';
    this.maxLogSize = 1024 * 1024; // 1MB
    this.ensureLogDir();
  }

  ensureLogDir() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      // Silently fail if we can't create log directory
    }
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
  }

  writeToFile(message) {
    try {
      // Check file size and rotate if necessary
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        if (stats.size > this.maxLogSize) {
          this.rotateLog();
        }
      }

      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      // Silently fail if we can't write to log file
    }
  }

  rotateLog() {
    try {
      const rotatedFile = this.logFile + '.old';
      if (fs.existsSync(rotatedFile)) {
        fs.unlinkSync(rotatedFile);
      }
      fs.renameSync(this.logFile, rotatedFile);
    } catch (error) {
      // Silently fail if we can't rotate log
    }
  }

  log(level, message, ...args) {
    const formattedMessage = this.formatMessage(level, message, ...args);
    this.writeToFile(formattedMessage);
  }

  debug(message, ...args) {
    this.log('debug', message, ...args);
    if (this.debugMode) {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  info(message, ...args) {
    this.log('info', message, ...args);
    if (this.debugMode) {
      console.log(chalk.blue(`[INFO] ${message}`), ...args);
    }
  }

  warn(message, ...args) {
    this.log('warn', message, ...args);
    if (this.debugMode) {
      console.warn(chalk.yellow(`[WARN] ${message}`), ...args);
    }
  }

  error(message, ...args) {
    this.log('error', message, ...args);
    console.error(chalk.red(`[ERROR] ${message}`), ...args);
  }

  success(message, ...args) {
    this.log('info', message, ...args);
    if (this.debugMode) {
      console.log(chalk.green(`[SUCCESS] ${message}`), ...args);
    }
  }

  // Enable debug mode temporarily
  enableDebug() {
    this.debugMode = true;
  }

  // Disable debug mode
  disableDebug() {
    this.debugMode = false;
  }

  // Get log file path
  getLogPath() {
    return this.logFile;
  }

  // Clear log file
  clearLog() {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.unlinkSync(this.logFile);
      }
    } catch (error) {
      this.error('Could not clear log file:', error.message);
    }
  }

  // Get recent log entries
  getRecentLogs(lines = 50) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const content = fs.readFileSync(this.logFile, 'utf8');
      const logLines = content.trim().split('\n');
      return logLines.slice(-lines);
    } catch (error) {
      this.error('Could not read log file:', error.message);
      return [];
    }
  }

  // Log system information for debugging
  logSystemInfo() {
    this.debug('System Information:', {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      homeDir: os.homedir(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PATH: process.env.PATH?.substring(0, 100) + '...' // Truncate PATH for privacy
      }
    });
  }
}

module.exports = Logger;