const fs = require('fs');
const path = require('path');
const os = require('os');

class Config {
  constructor() {
    this.configDir = path.join(os.homedir(), '.claude-code-updater');
    this.configFile = path.join(this.configDir, 'config.json');
    this.ensureConfigExists();
  }

  ensureConfigExists() {
    try {
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }

      if (!fs.existsSync(this.configFile)) {
        this.writeConfig(this.getDefaultConfig());
      }
    } catch (error) {
      console.warn('Warning: Could not create config directory:', error.message);
    }
  }

  getDefaultConfig() {
    return {
      lastUpdateCheck: null,
      lastUpdateTime: null,
      versionHistory: [],
      settings: {
        updateCooldown: 60 * 60 * 1000, // 1 hour
        maxVersionHistory: 10,
        enableLogging: true,
        autoUpdate: true
      }
    };
  }

  readConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const data = fs.readFileSync(this.configFile, 'utf8');
        return { ...this.getDefaultConfig(), ...JSON.parse(data) };
      }
    } catch (error) {
      console.warn('Warning: Could not read config file:', error.message);
    }
    return this.getDefaultConfig();
  }

  writeConfig(config) {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      console.warn('Warning: Could not write config file:', error.message);
    }
  }

  getLastUpdateCheck() {
    const config = this.readConfig();
    return config.lastUpdateCheck;
  }

  setLastUpdateCheck(timestamp) {
    const config = this.readConfig();
    config.lastUpdateCheck = timestamp;
    this.writeConfig(config);
  }

  getLastUpdateTime() {
    const config = this.readConfig();
    return config.lastUpdateTime;
  }

  setLastUpdateTime(timestamp) {
    const config = this.readConfig();
    config.lastUpdateTime = timestamp;
    this.writeConfig(config);
  }

  getVersionHistory() {
    const config = this.readConfig();
    return config.versionHistory || [];
  }

  addVersionHistory(fromVersion, toVersion) {
    const config = this.readConfig();
    const versionEntry = {
      from: fromVersion,
      to: toVersion,
      timestamp: Date.now(),
      success: true
    };

    config.versionHistory = config.versionHistory || [];
    config.versionHistory.push(versionEntry);

    // Keep only the last N entries
    const maxHistory = config.settings?.maxVersionHistory || 10;
    if (config.versionHistory.length > maxHistory) {
      config.versionHistory = config.versionHistory.slice(-maxHistory);
    }

    this.writeConfig(config);
  }

  getSettings() {
    const config = this.readConfig();
    return config.settings || this.getDefaultConfig().settings;
  }

  updateSettings(newSettings) {
    const config = this.readConfig();
    config.settings = { ...config.settings, ...newSettings };
    this.writeConfig(config);
  }

  // Clear all stored data
  reset() {
    try {
      if (fs.existsSync(this.configFile)) {
        fs.unlinkSync(this.configFile);
      }
      this.ensureConfigExists();
    } catch (error) {
      console.warn('Warning: Could not reset config:', error.message);
    }
  }

  // Get config file path for debugging
  getConfigPath() {
    return this.configFile;
  }

  // Check if auto-update is enabled
  isAutoUpdateEnabled() {
    const settings = this.getSettings();
    return settings.autoUpdate !== false;
  }

  // Get update cooldown period
  getUpdateCooldown() {
    const settings = this.getSettings();
    return settings.updateCooldown || 60 * 60 * 1000; // Default 1 hour
  }

  // Export config for backup
  exportConfig() {
    return this.readConfig();
  }

  // Import config from backup
  importConfig(configData) {
    try {
      // Validate basic structure
      if (typeof configData === 'object' && configData !== null) {
        const mergedConfig = { ...this.getDefaultConfig(), ...configData };
        this.writeConfig(mergedConfig);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Warning: Could not import config:', error.message);
      return false;
    }
  }
}

module.exports = Config;