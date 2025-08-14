#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

const Updater = require('../lib/updater');
const Logger = require('../lib/logger');

class ClaudeUpdaterCLI {
  constructor() {
    this.updater = new Updater('@anthropic-ai/claude-code', 'claude');
    this.logger = new Logger();
  }

  async run() {
    try {
      // Skip update check if --skip-update flag is present
      if (!process.argv.includes('--skip-update')) {
        await this.checkAndUpdate();
      }

      // Pass all arguments to the actual claude command
      const args = process.argv.slice(2).filter(arg => arg !== '--skip-update');
      await this.launchClaude(args);
    } catch (error) {
      this.logger.error('Failed to run Claude:', error.message);
      process.exit(1);
    }
  }

  async checkAndUpdate() {
    const spinner = ora('Checking for Claude updates...').start();
    
    try {
      const needsUpdate = await this.updater.checkForUpdate();
      
      if (needsUpdate) {
        spinner.text = 'Updating Claude Code...';
        await this.updater.performUpdate();
        spinner.succeed(chalk.green('Claude Code updated successfully!'));
      } else {
        spinner.succeed(chalk.blue('Claude Code is up to date'));
      }
    } catch (error) {
      spinner.fail(chalk.yellow('Update check failed, proceeding with current version'));
      this.logger.warn('Update error:', error.message);
    }
  }

  async launchClaude(args) {
    return new Promise((resolve, reject) => {
      // Try to find claude in the system PATH
      const claude = spawn('claude', args, {
        stdio: 'inherit',
        shell: true
      });

      claude.on('error', (error) => {
        if (error.code === 'ENOENT') {
          this.logger.error('Claude Code not found. Please install it first with: npm i -g @anthropic-ai/claude-code');
          reject(new Error('Claude Code not installed'));
        } else {
          reject(error);
        }
      });

      claude.on('close', (code) => {
        process.exit(code || 0);
      });

      // Handle process termination
      process.on('SIGINT', () => claude.kill('SIGINT'));
      process.on('SIGTERM', () => claude.kill('SIGTERM'));
    });
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Unhandled error:'), error.message);
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  const cli = new ClaudeUpdaterCLI();
  cli.run().catch(error => {
    console.error(chalk.red('Fatal error:'), error.message);
    process.exit(1);
  });
}

module.exports = ClaudeUpdaterCLI;