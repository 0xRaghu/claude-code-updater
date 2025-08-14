const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class ShellDetector {
  constructor() {
    this.homeDir = os.homedir();
    this.platform = os.platform();
  }

  detectShell() {
    try {
      // Get the current shell from environment
      const shell = process.env.SHELL || process.env.ComSpec || '';
      
      if (shell.includes('zsh')) return 'zsh';
      if (shell.includes('bash')) return 'bash';
      if (shell.includes('fish')) return 'fish';
      if (shell.includes('cmd')) return 'cmd';
      if (shell.includes('powershell') || shell.includes('pwsh')) return 'powershell';
      
      // Try to detect based on platform defaults
      if (this.platform === 'win32') {
        return this.detectWindowsShell();
      } else {
        return this.detectUnixShell();
      }
    } catch (error) {
      return this.getDefaultShell();
    }
  }

  detectWindowsShell() {
    try {
      // Check if PowerShell is available
      execSync('powershell.exe -Command "Get-Host"', { stdio: 'pipe' });
      return 'powershell';
    } catch (error) {
      return 'cmd';
    }
  }

  detectUnixShell() {
    try {
      // Check which shells are available
      const availableShells = execSync('cat /etc/shells 2>/dev/null || echo ""', { 
        encoding: 'utf8' 
      });

      // Prefer zsh if available (common on macOS)
      if (availableShells.includes('/bin/zsh') || availableShells.includes('/usr/bin/zsh')) {
        return 'zsh';
      }
      
      // Fallback to bash
      if (availableShells.includes('/bin/bash') || availableShells.includes('/usr/bin/bash')) {
        return 'bash';
      }

      return 'bash'; // Default assumption
    } catch (error) {
      return 'bash';
    }
  }

  getDefaultShell() {
    switch (this.platform) {
      case 'win32':
        return 'cmd';
      case 'darwin':
        return 'zsh'; // macOS default
      default:
        return 'bash'; // Linux/Unix default
    }
  }

  getShellConfigFile(shell = null) {
    const detectedShell = shell || this.detectShell();
    
    const configFiles = {
      zsh: ['.zshrc', '.zprofile'],
      bash: ['.bashrc', '.bash_profile', '.profile'],
      fish: ['.config/fish/config.fish'],
      cmd: null, // Windows cmd doesn't use config files in the same way
      powershell: ['Documents/PowerShell/profile.ps1', 'Documents/WindowsPowerShell/profile.ps1']
    };

    const files = configFiles[detectedShell];
    if (!files) return null;

    // Return the first existing file, or the primary one if none exist
    for (const file of files) {
      const fullPath = path.join(this.homeDir, file);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    // Return the primary config file path even if it doesn't exist
    return path.join(this.homeDir, files[0]);
  }

  getAllShellConfigFiles() {
    const shells = ['zsh', 'bash', 'fish'];
    const configFiles = [];

    for (const shell of shells) {
      const configFile = this.getShellConfigFile(shell);
      if (configFile && fs.existsSync(configFile)) {
        configFiles.push({ shell, file: configFile });
      }
    }

    return configFiles;
  }

  generateAliasCommand(aliasName, targetCommand) {
    const shell = this.detectShell();
    
    switch (shell) {
      case 'fish':
        return `alias ${aliasName} '${targetCommand}'`;
      case 'powershell':
        return `function ${aliasName} { & ${targetCommand} $args }`;
      case 'cmd':
        // CMD uses doskey for aliases
        return `doskey ${aliasName}=${targetCommand} $*`;
      default: // bash, zsh
        return `alias ${aliasName}='${targetCommand}'`;
    }
  }

  addAlias(aliasName, targetCommand, shell = null) {
    const configFile = this.getShellConfigFile(shell);
    if (!configFile) {
      throw new Error(`No config file found for shell: ${shell || this.detectShell()}`);
    }

    const aliasCommand = this.generateAliasCommand(aliasName, targetCommand);
    const comment = `# Added by claude-code-updater`;
    const aliasBlock = `\n${comment}\n${aliasCommand}\n`;

    try {
      // Ensure the config directory exists
      const configDir = path.dirname(configFile);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Check if alias already exists
      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf8');
        if (content.includes(aliasCommand)) {
          return false; // Alias already exists
        }
      }

      // Append the alias
      fs.appendFileSync(configFile, aliasBlock);
      return true;
    } catch (error) {
      throw new Error(`Failed to add alias to ${configFile}: ${error.message}`);
    }
  }

  removeAlias(aliasName, shell = null) {
    const configFile = this.getShellConfigFile(shell);
    if (!configFile || !fs.existsSync(configFile)) {
      return false;
    }

    try {
      const content = fs.readFileSync(configFile, 'utf8');
      const lines = content.split('\n');
      
      // Remove lines containing our alias and comment
      const filteredLines = lines.filter(line => {
        return !line.includes(`alias ${aliasName}=`) && 
               !line.includes(`function ${aliasName}`) &&
               !line.includes(`doskey ${aliasName}=`) &&
               !(line.includes('claude-code-updater') && line.includes('#'));
      });

      // Only write if content changed
      if (filteredLines.length !== lines.length) {
        fs.writeFileSync(configFile, filteredLines.join('\n'));
        return true;
      }
      
      return false;
    } catch (error) {
      throw new Error(`Failed to remove alias from ${configFile}: ${error.message}`);
    }
  }

  checkAliasExists(aliasName, shell = null) {
    const configFile = this.getShellConfigFile(shell);
    if (!configFile || !fs.existsSync(configFile)) {
      return false;
    }

    try {
      const content = fs.readFileSync(configFile, 'utf8');
      return content.includes(`alias ${aliasName}=`) || 
             content.includes(`function ${aliasName}`) ||
             content.includes(`doskey ${aliasName}=`);
    } catch (error) {
      return false;
    }
  }

  getSystemInfo() {
    return {
      platform: this.platform,
      shell: this.detectShell(),
      homeDir: this.homeDir,
      configFile: this.getShellConfigFile(),
      availableShells: this.getAllShellConfigFiles()
    };
  }
}

module.exports = ShellDetector;