# Claude Code Updater

A command-line tool that automatically manages and updates Claude Code installations with wrapper functionality.

## Overview

Claude Code Updater solves the problem of manual Claude Code updates by automatically checking for and installing updates before each execution. It provides seamless auto-update functionality with cross-platform support and shell integration.

## Features

- ✅ **Auto-update Claude Code** on each execution
- ✅ **Cross-platform support** (macOS, Linux, Windows)
- ✅ **Automatic shell alias configuration** (bash, zsh, fish, PowerShell)
- ✅ **Smart update caching** to avoid delays (1-hour cooldown)
- ✅ **Version tracking and rollback** capabilities
- ✅ **Clean installation and uninstallation**
- ✅ **Error handling and logging**
- ✅ **Zero-configuration** after installation

## Installation

### Via npm (Recommended)

```bash
npm install -g claude-code-updater
```

The installation will automatically:
- Set up shell aliases for seamless integration
- Create configuration directories
- Initialize logging

### Manual Installation

```bash
git clone https://github.com/0xRaghu/claude-code-updater.git
cd claude-code-updater
npm install
npm link
```

## Usage

After installation, simply use `claude` as you normally would:

```bash
# Auto-updates and runs Claude Code
claude

# Pass any arguments to Claude
claude --resume
claude -p "Hello, world!"

# Skip update check for faster startup
claude --skip-update
```

## How It Works

1. **Update Check**: When you run `claude`, it first checks for Claude Code updates
2. **Smart Caching**: Updates are checked at most once per hour to avoid delays
3. **Auto-Update**: If an update is available, it's installed automatically
4. **Execution**: Your original command is passed through to the actual Claude Code

## Configuration

### Config File Location

- **macOS/Linux**: `~/.claude-code-updater/config.json`
- **Windows**: `%USERPROFILE%\.claude-code-updater\config.json`

### Settings

```json
{
  "settings": {
    "updateCooldown": 3600000,
    "maxVersionHistory": 10,
    "enableLogging": true,
    "autoUpdate": true
  }
}
```

### Environment Variables

- `CLAUDE_UPDATER_DEBUG=true` - Enable debug logging
- `CLAUDE_UPDATER_SKIP_UPDATE=true` - Skip all update checks

## Shell Integration

The installer automatically adds aliases to your shell configuration:

### Bash/Zsh
```bash
alias claude='claude-code-updater'
```

### Fish
```fish
alias claude 'claude-code-updater'
```

### PowerShell
```powershell
function claude { & claude-code-updater $args }
```

## Commands

### Main Command
```bash
claude [arguments]  # Auto-update and run Claude Code
```

### Utility Commands
```bash
# Installation validation
npx claude-code-updater-install --validate

# Repair installation
npx claude-code-updater-install --repair

# Uninstall (preserve user data)
npm uninstall -g claude-code-updater

# Complete removal including user data
npx claude-code-updater-uninstall --clean
```

## Version Management

### Rollback to Previous Version
```javascript
const Updater = require('claude-code-updater/lib/updater');
const updater = new Updater('@anthropic-ai/claude-code', 'claude');
await updater.rollbackToPreviousVersion();
```

### Force Update
```bash
# Force update regardless of cooldown
CLAUDE_UPDATER_DEBUG=true claude --force-update
```

## Troubleshooting

### Common Issues

**1. Claude not found after installation**
```bash
# Check if Claude Code is installed
claude --version

# Install Claude Code if missing
npm install -g @anthropic-ai/claude-code
```

**2. Shell alias not working**
```bash
# Restart terminal or reload shell config
source ~/.zshrc  # or ~/.bashrc
```

**3. Permission errors**
```bash
# Fix npm permissions (Unix-like systems)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

### Debug Mode

Enable debug logging to troubleshoot issues:

```bash
export CLAUDE_UPDATER_DEBUG=true
claude --help
```

### Log Files

Check log files for detailed information:

```bash
# View recent logs
tail -f ~/.claude-code-updater/updater.log

# Clear logs
rm ~/.claude-code-updater/updater.log
```

### Manual Shell Setup

If automatic shell integration fails, add this alias manually:

```bash
# Add to ~/.zshrc, ~/.bashrc, or equivalent
alias claude='claude-code-updater'
```

## Uninstallation

### Method 1: Standard Uninstall (Recommended)
```bash
npm uninstall -g claude-code-updater
```
This automatically removes:
- ✅ The npm package
- ✅ Shell aliases 
- ✅ Binary files
- ⚠️ Preserves user data (`~/.claude-code-updater/`)

### Method 2: Complete Cleanup (If Standard Fails)
If the standard uninstall doesn't work completely, use our cleanup script:

```bash
# Download and run the cleanup script
curl -L https://raw.githubusercontent.com/0xRaghu/claude-code-updater/main/scripts/cleanup.js -o cleanup.js
node cleanup.js --clean

# Or if you have the package locally
npx claude-code-updater --cleanup --clean
```

### Method 3: Manual Cleanup
If both methods fail, manual cleanup:

```bash
# 1. Force remove npm package
npm uninstall -g claude-code-updater --force

# 2. Remove binary files
rm -f ~/.nvm/versions/node/*/bin/claude
rm -f ~/.nvm/versions/node/*/bin/claude-code-updater
sudo rm -f /usr/local/bin/claude
sudo rm -f /usr/local/bin/claude-code-updater

# 3. Remove shell aliases
# Edit ~/.bashrc, ~/.bash_profile, ~/.zshrc
# Remove lines containing "claude-code-updater" or "alias claude="

# 4. Remove user data (optional)
rm -rf ~/.claude-code-updater

# 5. Restart terminal
```

### Verification
After uninstallation, verify removal:
```bash
# Should show "command not found"
claude --version

# Should not list the package
npm list -g claude-code-updater
```

## Development

### Setup Development Environment
```bash
git clone https://github.com/0xRaghu/claude-code-updater.git
cd claude-code-updater
npm install
npm link
```

### Run Tests
```bash
npm test
```

### Debug Local Installation
```bash
CLAUDE_UPDATER_DEBUG=true node bin/claude-code-updater.js --help
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0
- Internet connection for updates

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/0xRaghu/claude-code-updater/issues)
- **Documentation**: [GitHub Wiki](https://github.com/0xRaghu/claude-code-updater/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/0xRaghu/claude-code-updater/discussions)

## Related Projects

- [Claude Code](https://github.com/anthropics/claude-code) - The official Claude Code
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates) - Update package dependencies

---

**Note**: This tool is an unofficial wrapper for the Claude Code and is not affiliated with Anthropic.