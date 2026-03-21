import readline from "readline";
import { exec } from "child_process";
// TEMP: mock function (replace with Claude later)
async function getCommand(intent) {
  if (intent.includes("kill") && intent.includes("3000")) {
    return {
      command: "kill -9 $(lsof -t -i :3000)",
      explanation: "Kills the process running on port 3000",
    };
  }

  return {
    command: "echo 'Command not recognized yet'",
    explanation: "Fallback response",
  };
}

export async function runAI(intent) {
  // Call Claude (pseudo for now)
  const response = await getCommand(intent);

  console.log("\nSuggested Command:\n", response.command);
  console.log("\nExplanation:\n", response.explanation);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nRun this command? (y/n): ", (answer) => {
    if (answer === "y") {
      exec(response.command, (err, stdout, stderr) => {
        console.log(stdout || stderr);
      });
    } else {
      console.log("Aborted.");
    }
    rl.close();
  });
}