# AI CLI

Run terminal commands using natural language with AI assistance.

## Quick Start

```bash
# Install globally
npm install -g @ai-helper/ai-cli

# First-time setup (required)
ai-cli init

# Use it
ai-cli "kill port 3000"
ai-cli "find large files in downloads"
ai-cli "compress all pdfs in this folder"
```

## Setup

On first use, you'll need to configure your OpenAI API key:

```bash
ai-cli init
```

This will:
- Prompt you for your OpenAI API key (get one at https://platform.openai.com/api-keys)
- Save configuration to `~/.ai-cli/config.json`
- Set up the CLI for immediate use

## Features

- **Natural language → commands** - Describe what you want in plain English
- **Safety first** - Blocks dangerous commands like `rm -rf`, `shutdown`, etc.
- **Interactive approval** - Review and approve commands before execution
- **Risk assessment** - Shows risk level (low/medium/high) for each command
- **Powered by GPT-4** - Uses OpenAI's latest models for accurate command generation

## Examples

```bash
# Process management
ai-cli "kill port 3000"

# File operations
ai-cli "find files larger than 100MB"
ai-cli "compress all images in this folder"

# System info
ai-cli "show disk usage"
ai-cli "list running processes using most memory"

# Network
ai-cli "check if port 8080 is in use"
ai-cli "show my public IP"

# Git operations
ai-cli "undo last commit but keep changes"
ai-cli "create a new branch called feature-x"

# Text processing
ai-cli "count lines in all js files"
ai-cli "find and replace foo with bar in all txt files"
```

## Configuration

Configuration is stored in `~/.ai-cli/config.json`:

```json
{
  "apiKey": "your-openai-api-key",
  "model": "gpt-4o-mini",
  "setupDate": "2024-03-21T..."
}
```

To reconfigure, run `ai-cli init` again.

## Safety

The CLI includes built-in safety checks:
- Blocks destructive commands (`rm -rf`, `mkfs`, `shutdown`, `reboot`)
- Requires explicit approval before executing any command
- Shows risk level assessment for transparency
- Uses GPT-4 with safety-focused prompts

## Publishing to npm

To publish this package:

```bash
# Login to npm (one-time)
npm login

# Publish (scoped packages require --access=public)
npm publish --access=public --otp=YOUR_OTP_CODE
```

## Development

```bash
# Install dependencies
npm install

# Link for local development
npm link

# Test locally
ai-cli "your intent"
ai-cli init

# Or run directly
node bin/ai.js "your intent"
node bin/ai.js init
```

## License

MIT