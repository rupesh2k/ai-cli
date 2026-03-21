import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";
import { PROVIDERS } from "./providers.js";

const CONFIG_DIR = path.join(os.homedir(), ".ai-cli");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function getConfigPath() {
  return CONFIG_FILE;
}

export function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig() {
  ensureConfigDir();

  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }

  try {
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading config:", error.message);
    return {};
  }
}

export function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey() {
  const config = loadConfig();
  return config.apiKey || process.env.OPENAI_API_KEY;
}

export function hasConfig() {
  const config = loadConfig();

  // Check if provider is configured
  if (!config.provider) {
    return false;
  }

  // Ollama doesn't need an API key
  if (config.provider === "ollama") {
    return true;
  }

  // Other providers need an API key
  return !!config.apiKey;
}

export async function initConfig() {
  console.log("Welcome to AI CLI setup!\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    // Select provider
    console.log("Available providers:");
    console.log("1. OpenAI (GPT-4, GPT-3.5) - Requires API key");
    console.log("2. Ollama (Local models) - Free, runs locally");
    console.log("3. Anthropic (Claude) - Requires API key");
    console.log("4. Google Gemini - Requires API key\n");

    const providerChoice = await question("Select provider (1-4): ");

    let provider, providerInfo;
    switch (providerChoice.trim()) {
      case "1":
        provider = "openai";
        break;
      case "2":
        provider = "ollama";
        break;
      case "3":
        provider = "anthropic";
        break;
      case "4":
        provider = "gemini";
        break;
      default:
        console.log("\nInvalid choice. Setup cancelled.");
        rl.close();
        return false;
    }

    providerInfo = PROVIDERS[provider];
    const config = {
      provider,
      setupDate: new Date().toISOString(),
    };

    // Handle Ollama separately (no API key needed)
    if (provider === "ollama") {
      console.log("\n✓ Selected: Ollama (Local)");
      console.log("\nMake sure Ollama is installed and running:");
      console.log("  Download: https://ollama.com/download");
      console.log("  Start: ollama serve");
      console.log("  Pull model: ollama pull llama3.2\n");

      const ollamaUrl = await question(
        "Ollama URL (default: http://localhost:11434): "
      );
      const ollamaModel = await question(
        `Model name (default: ${providerInfo.defaultModel}): `
      );

      config.ollamaUrl = ollamaUrl.trim() || "http://localhost:11434";
      config.ollamaModel = ollamaModel.trim() || providerInfo.defaultModel;

      saveConfig(config);
      console.log(`\n✓ Configuration saved to ${CONFIG_FILE}`);
      console.log("✓ You can now run: ai-cli \"your command\"\n");
      rl.close();
      return true;
    }

    // Handle API key for other providers
    console.log(`\n✓ Selected: ${providerInfo.name}`);
    console.log(`Get your API key at: ${providerInfo.keyUrl}\n`);

    const apiKey = await question("Enter your API key: ");

    if (!apiKey || !apiKey.trim()) {
      console.log("\nNo API key provided. Setup cancelled.");
      rl.close();
      return false;
    }

    config.apiKey = apiKey.trim();

    // Select model
    console.log(`\nAvailable models for ${providerInfo.name}:`);
    providerInfo.models.forEach((m, i) => {
      const defaultLabel = m === providerInfo.defaultModel ? " (default)" : "";
      console.log(`${i + 1}. ${m}${defaultLabel}`);
    });

    const modelChoice = await question(
      `\nSelect model (1-${providerInfo.models.length}, or press Enter for default): `
    );

    if (modelChoice.trim()) {
      const modelIndex = parseInt(modelChoice) - 1;
      if (modelIndex >= 0 && modelIndex < providerInfo.models.length) {
        if (provider === "openai") {
          config.model = providerInfo.models[modelIndex];
        } else if (provider === "anthropic") {
          config.anthropicModel = providerInfo.models[modelIndex];
        } else if (provider === "gemini") {
          config.geminiModel = providerInfo.models[modelIndex];
        }
      }
    } else {
      // Use default model
      if (provider === "openai") {
        config.model = providerInfo.defaultModel;
      } else if (provider === "anthropic") {
        config.anthropicModel = providerInfo.defaultModel;
      } else if (provider === "gemini") {
        config.geminiModel = providerInfo.defaultModel;
      }
    }

    saveConfig(config);

    console.log(`\n✓ Configuration saved to ${CONFIG_FILE}`);
    console.log("✓ You can now run: ai-cli \"your command\"\n");

    rl.close();
    return true;
  } catch (error) {
    console.error("Setup failed:", error.message);
    rl.close();
    return false;
  }
}
