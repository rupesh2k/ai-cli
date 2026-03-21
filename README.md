# cmdgpt

Run terminal commands using natural language with GPT.

## Quick Start

```bash
# Install globally
npm install -g cmdgpt

# First-time setup (required)
cmdgpt init

# Use it
cmdgpt "kill port 3000"
cmdgpt "find large files in downloads"
cmdgpt "compress all pdfs in this folder"
```

## Setup

On first use, you'll need to configure your OpenAI API key:

```bash
cmdgpt init
```

This will:
- Prompt you for your OpenAI API key (get one at https://platform.openai.com/api-keys)
- Save configuration to `~/.cmdgpt/config.json`
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
cmdgpt "kill port 3000"

# File operations
cmdgpt "find files larger than 100MB"
cmdgpt "compress all images in this folder"

# System info
cmdgpt "show disk usage"
cmdgpt "list running processes using most memory"

# Network
cmdgpt "check if port 8080 is in use"
cmdgpt "show my public IP"

# Git operations
cmdgpt "undo last commit but keep changes"
cmdgpt "create a new branch called feature-x"

# Text processing
cmdgpt "count lines in all js files"
cmdgpt "find and replace foo with bar in all txt files"
```

## Configuration

Configuration is stored in `~/.cmdgpt/config.json`:

```json
{
  "apiKey": "your-openai-api-key",
  "model": "gpt-4o-mini",
  "setupDate": "2024-03-21T..."
}
```

To reconfigure, run `cmdgpt init` again.

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

# Publish
npm publish
```

## Development

```bash
# Install dependencies
npm install

# Link for local development
npm link

# Test locally
cmdgpt "your intent"
cmdgpt init

# Or run directly
node bin/ai.js "your intent"
node bin/ai.js init
```

## License

MIT