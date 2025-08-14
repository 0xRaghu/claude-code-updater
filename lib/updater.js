const { execSync, exec } = require('child_process');
const https = require('https');
const semver = require('semver');
const Config = require('./config');
const Logger = require('./logger');

class Updater {
  constructor(packageName, commandName) {
    this.packageName = packageName;
    this.commandName = commandName;
    this.config = new Config();
    this.logger = new Logger();
    this.updateCooldown = 60 * 60 * 1000; // 1 hour in milliseconds
  }

  async checkForUpdate() {
    try {
      // Check if we've checked recently to avoid delays
      if (this.isWithinCooldown()) {
        this.logger.debug('Skipping update check (within cooldown period)');
        return false;
      }

      const [currentVersion, latestVersion] = await Promise.all([
        this.getCurrentVersion(),
        this.getLatestVersion()
      ]);

      if (!currentVersion) {
        this.logger.warn(`${this.commandName} not found, update needed`);
        return true;
      }

      const needsUpdate = semver.lt(currentVersion, latestVersion);
      
      // Update last check time
      this.config.setLastUpdateCheck(Date.now());
      
      if (needsUpdate) {
        this.logger.info(`Update available: ${currentVersion} -> ${latestVersion}`);
        // Store versions for rollback capability
        this.config.addVersionHistory(currentVersion, latestVersion);
      } else {
        this.logger.debug(`${this.commandName} is up to date (${currentVersion})`);
      }

      return needsUpdate;
    } catch (error) {
      this.logger.error('Error checking for updates:', error.message);
      return false;
    }
  }

  async performUpdate() {
    try {
      this.logger.info(`Updating ${this.packageName}...`);
      
      // Use execSync for synchronous execution to ensure update completes
      const result = execSync(`npm install -g ${this.packageName}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.logger.debug('Update output:', result);
      this.config.setLastUpdateTime(Date.now());
      
      // Verify the update was successful
      const newVersion = await this.getCurrentVersion();
      if (newVersion) {
        this.logger.info(`Successfully updated to version ${newVersion}`);
        return true;
      } else {
        throw new Error('Update verification failed');
      }
    } catch (error) {
      this.logger.error('Update failed:', error.message);
      throw error;
    }
  }

  async getCurrentVersion() {
    try {
      // Try to get version from the installed package
      const result = execSync(`${this.commandName} --version`, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 5000
      });
      
      // Extract version number from output
      const versionMatch = result.match(/(\d+\.\d+\.\d+)/);
      return versionMatch ? versionMatch[1] : null;
    } catch (error) {
      // If command fails, package might not be installed
      this.logger.debug(`Could not get current version: ${error.message}`);
      return null;
    }
  }

  async getLatestVersion() {
    return new Promise((resolve, reject) => {
      const url = `https://registry.npmjs.org/${this.packageName}/latest`;
      
      const req = https.get(url, { timeout: 10000 }, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const packageInfo = JSON.parse(data);
            resolve(packageInfo.version);
          } catch (error) {
            reject(new Error('Failed to parse npm registry response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Failed to fetch latest version: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout while fetching latest version'));
      });
    });
  }

  isWithinCooldown() {
    const lastCheck = this.config.getLastUpdateCheck();
    if (!lastCheck) return false;
    
    return (Date.now() - lastCheck) < this.updateCooldown;
  }

  async rollbackToPreviousVersion() {
    try {
      const versionHistory = this.config.getVersionHistory();
      if (versionHistory.length < 2) {
        throw new Error('No previous version available for rollback');
      }

      const previousVersion = versionHistory[versionHistory.length - 2];
      this.logger.info(`Rolling back to version ${previousVersion.from}`);
      
      const result = execSync(`npm install -g ${this.packageName}@${previousVersion.from}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.logger.info(`Successfully rolled back to ${previousVersion.from}`);
      return true;
    } catch (error) {
      this.logger.error('Rollback failed:', error.message);
      throw error;
    }
  }

  // Force update (bypass cooldown)
  async forceUpdate() {
    this.config.setLastUpdateCheck(0); // Reset cooldown
    return await this.checkForUpdate() && await this.performUpdate();
  }
}

module.exports = Updater;