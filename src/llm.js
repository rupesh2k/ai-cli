import readline from "readline";
import { exec } from "child_process";
import { hasConfig, loadConfig } from "./config.js";
import { isSafe } from "./safety.js";
import { getCommand, PROVIDERS } from "./providers.js";

export async function runAI(intent) {
  // Check for configuration first
  if (!hasConfig()) {
    console.error("\n❌ Error: AI CLI not configured");
    console.log("\nPlease run: ai-cli init\n");
    process.exit(1);
  }

  const config = loadConfig();
  const providerInfo = PROVIDERS[config.provider];

  try {
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

    // Display command
    console.log("Suggested Command:");
    console.log(`  ${response.command}`);
    console.log("\nExplanation:");
    console.log(`  ${response.explanation}`);
    console.log(`\nRisk Level: ${response.risk}`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("\nRun this command? (y/n): ", (answer) => {
      if (answer.toLowerCase() === "y") {
        console.log("\n▶ Executing...\n");
        exec(response.command, (err, stdout, stderr) => {
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