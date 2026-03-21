import readline from "readline";
import { exec } from "child_process";
import { getApiKey, hasApiKey, loadConfig } from "./config.js";
import { isSafe } from "./safety.js";

async function getCommand(intent) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("API key not configured");
  }

  const config = loadConfig();
  const model = config.model || "gpt-4o-mini";

  const systemPrompt = `You are a CLI assistant that converts user intents into shell commands.
Return ONLY valid JSON in this format:
{
  "command": "the shell command",
  "explanation": "brief explanation of what it does",
  "risk": "low|medium|high"
}

Rules:
- Use safe, standard Unix/macOS commands
- Prefer non-destructive options when possible
- For file operations, be explicit about paths
- Never use rm -rf, mkfs, shutdown, or reboot
- If the intent is unclear, suggest the safest interpretation`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: intent },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from API");
    }

    // Parse JSON response
    const result = JSON.parse(content);

    if (!result.command || !result.explanation) {
      throw new Error("Invalid response format from API");
    }

    return result;
  } catch (error) {
    if (error.message.includes("JSON")) {
      throw new Error("Failed to parse API response. Please try again.");
    }
    throw error;
  }
}

export async function runAI(intent) {
  // Check for API key first
  if (!hasApiKey()) {
    console.error("\n❌ Error: No API key configured");
    console.log("\nPlease run: ai init\n");
    process.exit(1);
  }

  try {
    console.log("\n⏳ Generating command...\n");

    const response = await getCommand(intent);

    // Safety check
    if (!isSafe(response.command)) {
      console.error("❌ Command blocked by safety filter");
      console.log("\nThis command is potentially destructive and has been blocked.");
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
    if (error.message.includes("API key")) {
      console.log("\nYour API key may be invalid. Run: ai init\n");
    }
    process.exit(1);
  }
}