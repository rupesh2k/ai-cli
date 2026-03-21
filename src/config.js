import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";

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

export function hasApiKey() {
  return !!getApiKey();
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
    const apiKey = await question(
      "Enter your OpenAI API key (get one at https://platform.openai.com/api-keys): "
    );

    if (!apiKey || !apiKey.trim()) {
      console.log("\nNo API key provided. Setup cancelled.");
      rl.close();
      return false;
    }

    const config = {
      apiKey: apiKey.trim(),
      model: "gpt-4o-mini",
      setupDate: new Date().toISOString(),
    };

    saveConfig(config);

    console.log(`\n✓ Configuration saved to ${CONFIG_FILE}`);
    console.log("✓ You can now run: ai \"your command\"\n");

    rl.close();
    return true;
  } catch (error) {
    console.error("Setup failed:", error.message);
    rl.close();
    return false;
  }
}
