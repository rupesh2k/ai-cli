import readline from "readline";
import { exec } from "child_process";
import { hasConfig, loadConfig } from "./config.js";
import { isSafe } from "./safety.js";
import { getCommand, PROVIDERS } from "./providers.js";
import {
  detectPlaceholders,
  promptForPlaceholders,
  hasPlaceholders,
} from "./placeholders.js";

export async function runAI(intent, options = {}) {
  // Check for configuration first
  if (!hasConfig()) {
    console.error("\n❌ Error: AI CLI not configured");
    console.log("\nPlease run: ai-cli init\n");
    process.exit(1);
  }

  const config = loadConfig();
  const providerInfo = PROVIDERS[config.provider];

  try {
    const isDryRun = options.dryRun;
    const isVerbose = options.verbose;

    console.log(`\n⏳ Generating command using ${providerInfo.name}...\n`);

    const response = await getCommand(intent, config);

    // Safety check
    if (!isSafe(response.command)) {
      console.error("❌ Command blocked by safety filter");
      console.log(
        "\nThis command is potentially destructive and has been blocked."
      );
      console.log("Command:", response.command);
      process.exit(1);
    }

    // Dry-run mode
    if (isDryRun) {
      console.log("🔍 DRY RUN MODE - Command preview only\n");
      console.log("=".repeat(60));
      console.log("\n📝 Generated Command:");
      console.log(`  ${response.command}`);
      console.log("\n💬 Explanation:");
      console.log(`  ${response.explanation}`);
      console.log(`\n⚠️  Risk Level: ${response.risk.toUpperCase()}`);

      // Parse command for more details
      const commandParts = response.command.split(" ");
      const mainCommand = commandParts[0];

      console.log("\n🔧 Command Breakdown:");
      console.log(`  • Main command: ${mainCommand}`);
      console.log(`  • Arguments: ${commandParts.slice(1).join(" ") || "none"}`);

      // Check for placeholders
      const placeholders = detectPlaceholders(response.command);
      if (placeholders.length > 0) {
        console.log("\n📝 Placeholders detected:");
        placeholders.forEach((p) => {
          console.log(`  • ${p.name} (will prompt when executing)`);
        });
      }

      // Check for file operations
      if (
        response.command.includes("rm") ||
        response.command.includes("delete")
      ) {
        console.log("\n⚠️  WARNING: This command deletes files/directories");
      }
      if (
        response.command.includes("mv") ||
        response.command.includes("move")
      ) {
        console.log("\n📦 This command moves/renames files");
      }
      if (
        response.command.includes("cp") ||
        response.command.includes("copy")
      ) {
        console.log("\n📋 This command copies files");
      }
      if (response.command.includes(">") || response.command.includes(">>")) {
        console.log("\n📄 This command writes to a file");
      }

      console.log("\n" + "=".repeat(60));
      console.log(
        "\n💡 This is a preview only. To execute, run without --dry-run\n"
      );
      return;
    }

    // Display command (normal mode)
    console.log("Suggested Command:");
    console.log(`  ${response.command}`);
    console.log("\nExplanation:");
    console.log(`  ${response.explanation}`);
    console.log(`\nRisk Level: ${response.risk}`);

    // Verbose mode - show more details
    if (isVerbose) {
      console.log("\n" + "=".repeat(60));
      console.log("\n📊 Detailed Analysis:");
      const commandParts = response.command.split(" ");
      console.log(`  • Command: ${commandParts[0]}`);
      console.log(`  • Arguments: ${commandParts.slice(1).join(" ")}`);
      console.log(`  • Provider: ${providerInfo.name}`);
      console.log(`  • Model: ${getModelName(config)}`);
      console.log("\n" + "=".repeat(60));
    }

    // Check for placeholders and prompt for values
    let finalCommand = response.command;
    const placeholders = detectPlaceholders(response.command);

    if (placeholders.length > 0) {
      console.log(
        `\n🔧 Detected ${placeholders.length} placeholder${
          placeholders.length > 1 ? "s" : ""
        } in the command:`
      );
      placeholders.forEach((p) => {
        console.log(`  • ${p.name}`);
      });

      finalCommand = await promptForPlaceholders(response.command, placeholders);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("\nRun this command? (y/n): ", (answer) => {
      if (answer.toLowerCase() === "y") {
        console.log("\n▶ Executing...\n");
        exec(finalCommand, (err, stdout, stderr) => {
          if (err) {
            console.error("❌ Command failed:", err.message);
          }
          if (stdout) console.log(stdout);
          if (stderr) console.error(stderr);
        });
      } else {
        console.log("\n✓ Aborted.");
      }
      rl.close();
    });
  } catch (error) {
    console.error("\n❌ Error:", error.message);

    // Provider-specific error messages
    if (config.provider === "ollama") {
      if (error.message.includes("ECONNREFUSED")) {
        console.log("\n💡 Ollama is not running. Start it with:");
        console.log("   ollama serve\n");
      } else if (error.message.includes("not found")) {
        console.log("\n💡 Model not found. Pull it with:");
        console.log(`   ollama pull ${config.ollamaModel || "llama3.2"}\n`);
      }
    } else {
      if (
        error.message.includes("API key") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        console.log("\n💡 Your API key may be invalid. Run: ai-cli init\n");
      }
    }

    process.exit(1);
  }
}

// Helper function to get model name from config
function getModelName(config) {
  switch (config.provider) {
    case "openai":
      return config.model || "gpt-4o-mini";
    case "ollama":
      return config.ollamaModel || "llama3.2";
    case "anthropic":
      return config.anthropicModel || "claude-3-5-sonnet-20241022";
    case "gemini":
      return config.geminiModel || "gemini-1.5-flash";
    default:
      return "unknown";
  }
}