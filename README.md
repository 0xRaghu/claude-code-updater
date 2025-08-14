# Claude Code Updater

A command-line tool that automatically manages and updates Claude CLI installations with wrapper functionality.

## Overview

Claude Code Updater solves the problem of manual Claude CLI updates by automatically checking for and installing updates before each execution. It provides seamless auto-update functionality with cross-platform support and shell integration.

## Features

- ✅ **Auto-update Claude CLI** on each execution
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
git clone https://github.com/yourusername/claude-code-updater.git
cd claude-code-updater
npm install
npm link
```

## Usage

After installation, simply use `claude` as you normally would:

```bash
# Auto-updates and runs Claude CLI
claude

# Pass any arguments to Claude
claude --help
claude "Hello, world!"

# Skip update check for faster startup
claude --skip-update "Quick command"
```

## How It Works

1. **Update Check**: When you run `claude`, it first checks for Claude CLI updates
2. **Smart Caching**: Updates are checked at most once per hour to avoid delays
3. **Auto-Update**: If an update is available, it's installed automatically
4. **Execution**: Your original command is passed through to the actual Claude CLI

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
claude [arguments]  # Auto-update and run Claude CLI
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
# Check if Claude CLI is installed
claude --version

# Install Claude CLI if missing
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

### Standard Uninstall (Preserves User Data)
```bash
npm uninstall -g claude-code-updater
```

### Complete Removal
```bash
# Remove package and all user data
npx claude-code-updater-uninstall --clean
npm uninstall -g claude-code-updater
```

## Development

### Setup Development Environment
```bash
git clone https://github.com/yourusername/claude-code-updater.git
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

- **Issues**: [GitHub Issues](https://github.com/yourusername/claude-code-updater/issues)
- **Documentation**: [GitHub Wiki](https://github.com/yourusername/claude-code-updater/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/claude-code-updater/discussions)

## Related Projects

- [Claude CLI](https://github.com/anthropics/claude-code) - The official Claude CLI
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates) - Update package dependencies

---

**Note**: This tool is an unofficial wrapper for the Claude CLI and is not affiliated with Anthropic.