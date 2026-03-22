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
- **Multiple AI providers** - Choose from OpenAI, Ollama (local), Anthropic Claude, or Google Gemini
- **Local models support** - Run completely offline with Ollama
- **Interactive placeholders** - Automatically prompts for command arguments like `<PORT>`, `YOUR_MESSAGE`, etc.
- **Dry-run mode** - Preview commands before execution
- **Safety first** - Blocks dangerous commands like `rm -rf`, `shutdown`, etc.
- **Interactive approval** - Review and approve commands before execution
- **Risk assessment** - Shows risk level (low/medium/high) for each command

## Examples

### Basic Usage

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

### Dry Run Mode (Preview Only)

Preview what a command will do without executing it:

```bash
# See what the command would do
ai-cli --dry-run "delete all log files"

# Output shows:
# 🔍 DRY RUN MODE - Command preview only
# ============================================================
# 📝 Generated Command:
#   rm /var/log/*.log
# 💬 Explanation:
#   Removes all .log files from /var/log directory
# ⚠️  Risk Level: HIGH
# 🔧 Command Breakdown:
#   • Main command: rm
#   • Arguments: /var/log/*.log
# ⚠️  WARNING: This command deletes files/directories
# ============================================================
# 💡 This is a preview only. To execute, run without --dry-run

# Short form
ai-cli -d "compress this folder"
```

### Verbose Mode (Detailed Information)

Get detailed analysis of the command:

```bash
# Show extra details
ai-cli --verbose "install redis"

# Or combine with dry-run
ai-cli -d -v "create a backup of this directory"

# Shows provider, model, command breakdown, and more
```

### Interactive Placeholders

When commands have placeholders, the CLI automatically prompts for values:

```bash
$ ai-cli "commit my changes with a message"

⏳ Generating command using OpenAI...

Suggested Command:
  git commit -m "YOUR_MESSAGE"

Explanation:
  Commits staged changes with your commit message

Risk Level: low

🔧 Detected 1 placeholder in the command:
  • YOUR_MESSAGE

📝 This command needs some information from you:

  your message: Fixed login bug

✓ Final command:
  git commit -m "Fixed login bug"

Run this command? (y/n): y
```

**Supported placeholder formats:**
- `<PLACEHOLDER>` - e.g., `<PORT>`, `<FILE>`
- `${PLACEHOLDER}` - e.g., `${USERNAME}`, `${PATH}`
- `YOUR_*` - e.g., `YOUR_MESSAGE`, `YOUR_NAME`
- `[PLACEHOLDER]` - e.g., `[OPTION]`, `[VALUE]`

**Examples:**
```bash
# Git commit with message
ai-cli "commit with message about bug fix"
# Prompts: your message: Fixed authentication bug

# Docker run with port
ai-cli "run nginx container on port 8080"
# Prompts: port: 8080

# Create file with name
ai-cli "create a new file named config"
# Prompts: file name: config.json
```

## AI Providers

Choose from multiple AI providers during setup:

### 1. **OpenAI** (GPT-4, GPT-3.5-turbo)
- Requires API key from https://platform.openai.com/api-keys
- Models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`
- Fast and accurate

### 2. **Ollama** (Local Models - FREE!)
- No API key needed - runs completely offline
- Download from https://ollama.com/download
- Models: `llama3.2`, `llama3.1`, `mistral`, `codellama`, `gemma2`, `qwen2.5`
- Free and private

Setup Ollama:
```bash
# Install Ollama
brew install ollama  # or download from ollama.com

# Start Ollama
ollama serve

# Pull a model
ollama pull llama3.2

# Configure ai-cli to use Ollama
ai-cli init
# Select option 2 (Ollama)
```

### 3. **Anthropic** (Claude)
- Requires API key from https://console.anthropic.com/settings/keys
- Models: `claude-3-5-sonnet`, `claude-3-5-haiku`, `claude-3-opus`
- Excellent reasoning capabilities

### 4. **Google Gemini**
- Requires API key from https://aistudio.google.com/app/apikey
- Models: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash-exp`
- Fast and multimodal

## Configuration

Configuration is stored in `~/.ai-cli/config.json`:

### OpenAI config example:
```json
{
  "provider": "openai",
  "apiKey": "your-openai-api-key",
  "model": "gpt-4o-mini",
  "setupDate": "2024-03-21T..."
}
```

### Ollama config example:
```json
{
  "provider": "ollama",
  "ollamaUrl": "http://localhost:11434",
  "ollamaModel": "llama3.2",
  "setupDate": "2024-03-21T..."
}
```

To reconfigure, run `ai-cli init` again.

## Command Options

### `--dry-run` / `-d`
Preview the command without executing it. Shows:
- The generated command
- Detailed explanation
- Risk level assessment
- Command breakdown
- Special warnings for file operations (delete, move, write)

Perfect for:
- Testing potentially dangerous commands
- Learning what commands do
- Verifying the AI understood your intent

### `--verbose` / `-v`
Show additional details:
- AI provider and model used
- Command structure breakdown
- Detailed analysis

Can be combined with `--dry-run`:
```bash
ai-cli -d -v "your intent"
```

## Safety

The CLI includes built-in safety checks:
- **Dry-run mode** - Preview commands before execution
- **Safety filter** - Blocks destructive commands (`rm -rf`, `mkfs`, `shutdown`, `reboot`)
- **Interactive approval** - Requires explicit confirmation before executing
- **Risk assessment** - Shows risk level (low/medium/high) for transparency
- **Secure prompts** - AI models trained with safety-focused instructions

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