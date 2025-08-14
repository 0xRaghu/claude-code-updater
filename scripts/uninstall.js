#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const ShellDetector = require('../lib/shell-detector');
const Logger = require('../lib/logger');
const Config = require('../lib/config');

class Uninstaller {
  constructor() {
    this.shellDetector = new ShellDetector();
    this.logger = new Logger();
    this.config = new Config();
  }

  async uninstall() {
    try {
      console.log(chalk.blue('🗑️  Uninstalling Claude Code Updater...'));
      
      // Remove shell aliases
      await this.removeShellAliases();
      
      // Ask user about config and logs
      await this.handleUserData();
      
      // Log uninstallation
      this.logger.info('Claude Code Updater uninstalled');
      
      console.log(chalk.green('\n✅ Uninstallation completed successfully!'));
      console.log(chalk.cyan('\nNote: You may need to restart your terminal to complete removal.'));
      
    } catch (error) {
      console.error(chalk.red('❌ Uninstallation failed:'), error.message);
      this.logger.error('Uninstallation failed:', error.message);
      process.exit(1);
    }
  }

  async removeShellAliases() {
    try {
      console.log(chalk.blue('🔧 Removing shell aliases...'));
      
      // Get all shell configurations
      const allShells = this.shellDetector.getAllShellConfigFiles();
      const systemInfo = this.shellDetector.getSystemInfo();
      
      // Add current shell config if not in the list
      if (systemInfo.configFile && !allShells.some(s => s.file === systemInfo.configFile)) {
        allShells.push({ shell: systemInfo.shell, file: systemInfo.configFile });
      }

      let removedCount = 0;
      
      for (const { shell, file } of allShells) {
        try {
          const removed = this.shellDetector.removeAlias('claude', shell);
          if (removed) {
            console.log(chalk.green(`✅ Removed alias from ${shell}: ${file}`));
            removedCount++;
          } else {
            console.log(chalk.gray(`No alias found in ${shell}: ${file}`));
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Could not remove alias from ${shell}: ${error.message}`));
        }
      }

      if (removedCount === 0) {
        console.log(chalk.yellow('⚠️  No aliases found to remove'));
      } else {
        console.log(chalk.green(`✅ Removed ${removedCount} shell alias(es)`));
      }

    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not remove shell aliases:'), error.message);
      this.printManualRemovalInstructions();
    }
  }

  async handleUserData() {
    const configPath = this.config.getConfigPath();
    const logPath = this.logger.getLogPath();
    
    // Check if config/log files exist
    const configExists = fs.existsSync(configPath);
    const logExists = fs.existsSync(logPath);
    
    if (!configExists && !logExists) {
      console.log(chalk.gray('No user data found to remove.'));
      return;
    }

    console.log(chalk.cyan('\n📁 User Data Found:'));
    if (configExists) {
      console.log(chalk.white(`  Config: ${configPath}`));
    }
    if (logExists) {
      console.log(chalk.white(`  Logs: ${logPath}`));
    }

    // For npm uninstall, we'll be conservative and keep user data by default
    // Users can manually remove it or use a --clean flag
    const shouldClean = process.argv.includes('--clean') || process.argv.includes('--purge');
    
    if (shouldClean) {
      await this.removeUserData();
    } else {
      console.log(chalk.yellow('\n⚠️  User data preserved.'));
      console.log(chalk.white('To remove user data, run: npx claude-code-updater-uninstall --clean'));
      console.log(chalk.white('Or manually delete:'));
      if (configExists) {
        console.log(chalk.gray(`  rm ${configPath}`));
      }
      if (logExists) {
        console.log(chalk.gray(`  rm ${logPath}`));
      }
      console.log(chalk.gray(`  rmdir ${path.dirname(configPath)}`));
    }
  }

  async removeUserData() {
    try {
      console.log(chalk.blue('🗑️  Removing user data...'));
      
      const configPath = this.config.getConfigPath();
      const logPath = this.logger.getLogPath();
      const configDir = path.dirname(configPath);
      
      // Remove config file
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
        console.log(chalk.green('✅ Removed config file'));
      }
      
      // Remove log file
      if (fs.existsSync(logPath)) {
        fs.unlinkSync(logPath);
        console.log(chalk.green('✅ Removed log file'));
      }
      
      // Remove config directory if empty
      try {
        const files = fs.readdirSync(configDir);
        if (files.length === 0) {
          fs.rmdirSync(configDir);
          console.log(chalk.green('✅ Removed config directory'));
        }
      } catch (error) {
        // Directory not empty or doesn't exist, ignore
      }
      
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not remove some user data:'), error.message);
    }
  }

  printManualRemovalInstructions() {
    console.log(chalk.cyan('\n📖 Manual Removal Instructions:'));
    console.log(chalk.white('Remove the following alias from your shell configuration files:'));
    
    const shell = this.shellDetector.detectShell();
    const aliasCommand = this.shellDetector.generateAliasCommand('claude', 'claude-code-updater');
    
    console.log(chalk.yellow(`\n  ${aliasCommand}`));
    
    console.log(chalk.white('\nCheck these files:'));
    console.log(chalk.gray('  ~/.bashrc, ~/.bash_profile'));
    console.log(chalk.gray('  ~/.zshrc'));
    console.log(chalk.gray('  ~/.config/fish/config.fish'));
    console.log(chalk.gray('  PowerShell $PROFILE'));
    
    console.log(chalk.white('\nLook for lines containing:'));
    console.log(chalk.gray('  # Added by claude-code-updater'));
    console.log(chalk.gray('  alias claude='));
  }

  // Check what would be removed (dry run)
  async dryRun() {
    console.log(chalk.blue('🔍 Dry run - checking what would be removed:'));
    
    // Check shell aliases
    const allShells = this.shellDetector.getAllShellConfigFiles();
    const systemInfo = this.shellDetector.getSystemInfo();
    
    console.log(chalk.cyan('\nShell aliases to check:'));
    for (const { shell, file } of allShells) {
      const exists = this.shellDetector.checkAliasExists('claude', shell);
      console.log(chalk.white(`  ${shell}: ${file} ${exists ? '✅' : '❌'}`));
    }
    
    // Check user data
    const configPath = this.config.getConfigPath();
    const logPath = this.logger.getLogPath();
    
    console.log(chalk.cyan('\nUser data to check:'));
    console.log(chalk.white(`  Config: ${configPath} ${fs.existsSync(configPath) ? '✅' : '❌'}`));
    console.log(chalk.white(`  Logs: ${logPath} ${fs.existsSync(logPath) ? '✅' : '❌'}`));
  }

  // Force removal of everything
  async forceUninstall() {
    console.log(chalk.red('🚨 Force uninstall - removing everything...'));
    process.argv.push('--clean'); // Ensure user data is removed
    await this.uninstall();
  }
}

// Run uninstallation if this script is executed directly
if (require.main === module) {
  const uninstaller = new Uninstaller();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--dry-run')) {
    uninstaller.dryRun();
  } else if (args.includes('--force')) {
    uninstaller.forceUninstall();
  } else {
    uninstaller.uninstall();
  }
}

module.exports = Uninstaller;