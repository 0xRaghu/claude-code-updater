#!/usr/bin/env node

const chalk = require('chalk');
const ShellDetector = require('../lib/shell-detector');
const Logger = require('../lib/logger');
const Config = require('../lib/config');

class Installer {
  constructor() {
    this.shellDetector = new ShellDetector();
    this.logger = new Logger();
    this.config = new Config();
  }

  async install() {
    try {
      console.log(chalk.blue('🚀 Installing Claude Code Updater...'));
      
      // Initialize configuration
      this.config.ensureConfigExists();
      console.log(chalk.green('✅ Configuration initialized'));

      // Setup shell alias
      await this.setupShellAlias();
      
      // Log installation
      this.logger.info('Claude Code Updater installed successfully');
      this.logger.logSystemInfo();

      console.log(chalk.green('\n🎉 Installation completed successfully!'));
      console.log(chalk.cyan('\nUsage:'));
      console.log(chalk.white('  claude [arguments]  # Will auto-update and run Claude Code'));
      console.log(chalk.white('  claude --skip-update [arguments]  # Skip update check'));
      
      console.log(chalk.cyan('\nConfiguration:'));
      console.log(chalk.white(`  Config file: ${this.config.getConfigPath()}`));
      console.log(chalk.white(`  Log file: ${this.logger.getLogPath()}`));
      
      console.log(chalk.yellow('\nNote: You may need to restart your terminal or run:'));
      console.log(chalk.white(`  source ${this.shellDetector.getShellConfigFile()}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error.message);
      this.logger.error('Installation failed:', error.message);
      process.exit(1);
    }
  }

  async setupShellAlias() {
    try {
      const systemInfo = this.shellDetector.getSystemInfo();
      console.log(chalk.blue('🔧 Setting up shell integration...'));
      console.log(chalk.gray(`Detected shell: ${systemInfo.shell}`));
      console.log(chalk.gray(`Config file: ${systemInfo.configFile}`));

      // Check if we can set up the alias
      if (!systemInfo.configFile) {
        console.log(chalk.yellow('⚠️  Could not detect shell config file. Manual setup may be required.'));
        this.printManualSetupInstructions();
        return;
      }

      // Add the alias
      const targetCommand = 'claude-code-updater';
      const aliasAdded = this.shellDetector.addAlias('claude', targetCommand);
      
      if (aliasAdded) {
        console.log(chalk.green('✅ Shell alias added successfully'));
        console.log(chalk.gray(`Added alias to: ${systemInfo.configFile}`));
      } else {
        console.log(chalk.yellow('⚠️  Alias already exists or could not be added'));
      }

      // Also try to set up for other shells if they exist
      const allShells = this.shellDetector.getAllShellConfigFiles();
      if (allShells.length > 1) {
        console.log(chalk.blue('🔧 Setting up additional shell configurations...'));
        
        for (const { shell, file } of allShells) {
          if (file !== systemInfo.configFile) {
            try {
              const added = this.shellDetector.addAlias('claude', targetCommand, shell);
              if (added) {
                console.log(chalk.green(`✅ Added alias for ${shell}: ${file}`));
              }
            } catch (error) {
              console.log(chalk.yellow(`⚠️  Could not add alias for ${shell}: ${error.message}`));
            }
          }
        }
      }

    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not set up shell alias:'), error.message);
      this.printManualSetupInstructions();
    }
  }

  printManualSetupInstructions() {
    console.log(chalk.cyan('\n📖 Manual Setup Instructions:'));
    console.log(chalk.white('Add the following alias to your shell configuration file:'));
    
    const shell = this.shellDetector.detectShell();
    const aliasCommand = this.shellDetector.generateAliasCommand('claude', 'claude-code-updater');
    
    console.log(chalk.yellow(`\n  ${aliasCommand}`));
    
    console.log(chalk.white('\nShell configuration files:'));
    console.log(chalk.gray('  bash: ~/.bashrc or ~/.bash_profile'));
    console.log(chalk.gray('  zsh: ~/.zshrc'));
    console.log(chalk.gray('  fish: ~/.config/fish/config.fish'));
    console.log(chalk.gray('  PowerShell: $PROFILE'));
  }

  // Check if installation is valid
  validateInstallation() {
    try {
      // Check if config exists
      const configExists = this.config.getConfigPath();
      
      // Check if alias exists
      const aliasExists = this.shellDetector.checkAliasExists('claude');
      
      console.log(chalk.blue('🔍 Validating installation...'));
      console.log(chalk.white(`Config file: ${configExists ? '✅' : '❌'}`));
      console.log(chalk.white(`Shell alias: ${aliasExists ? '✅' : '❌'}`));
      
      return configExists && aliasExists;
    } catch (error) {
      console.log(chalk.red('❌ Validation failed:'), error.message);
      return false;
    }
  }

  // Repair installation
  async repair() {
    console.log(chalk.blue('🔧 Repairing installation...'));
    await this.install();
  }
}

// Run installation if this script is executed directly
if (require.main === module) {
  const installer = new Installer();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--validate')) {
    installer.validateInstallation();
  } else if (args.includes('--repair')) {
    installer.repair();
  } else {
    installer.install();
  }
}

module.exports = Installer;