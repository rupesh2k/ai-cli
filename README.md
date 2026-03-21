# AI CLI

Run terminal commands using natural language with AI assistance.

## Quick Start

```bash
# Install globally
npm install -g ai-cli

# First-time setup (required)
ai init

# Use it
ai "kill port 3000"
ai "find large files in downloads"
ai "compress all pdfs in this folder"
```

## Setup

On first use, you'll need to configure your OpenAI API key:

```bash
ai init
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
ai "kill port 3000"

# File operations
ai "find files larger than 100MB"
ai "compress all images in this folder"

# System info
ai "show disk usage"
ai "list running processes using most memory"

# Network
ai "check if port 8080 is in use"
ai "show my public IP"
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

To reconfigure, run `ai init` again.

## Safety

The CLI includes built-in safety checks:
- Blocks destructive commands (`rm -rf`, `mkfs`, `shutdown`, `reboot`)
- Requires explicit approval before executing any command
- Shows risk level assessment for transparency
- Uses GPT-4 with safety-focused prompts

## Development

```bash
# Install dependencies
npm install

# Run locally
node bin/ai.js "your intent"

# Run init locally
node bin/ai.js init
```

## License

MIT