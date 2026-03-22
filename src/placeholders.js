import readline from "readline";

// Detect placeholders in command
// Matches patterns like: <PORT>, <FILE>, YOUR_MESSAGE, ${VAR}, etc.
export function detectPlaceholders(command) {
  const patterns = [
    /<([^>]+)>/g, // <PLACEHOLDER>
    /\$\{([^}]+)\}/g, // ${PLACEHOLDER}
    /YOUR_\w+/gi, // YOUR_MESSAGE, YOUR_FILE, etc.
    /\[([^\]]+)\]/g, // [PLACEHOLDER]
  ];

  const placeholders = new Set();

  patterns.forEach((pattern) => {
    const matches = command.matchAll(pattern);
    for (const match of matches) {
      // Use the captured group or the full match
      const placeholder = match[1] || match[0];
      placeholders.add({
        original: match[0],
        name: placeholder,
        pattern: match[0],
      });
    }
  });

  return Array.from(placeholders);
}

// Prompt user for placeholder values
export async function promptForPlaceholders(command, placeholders) {
  if (placeholders.length === 0) {
    return command;
  }

  console.log("\n📝 This command needs some information from you:\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  const replacements = {};

  try {
    for (const placeholder of placeholders) {
      const cleanName = placeholder.name
        .replace(/_/g, " ")
        .toLowerCase()
        .trim();

      const value = await question(`  ${cleanName}: `);

      if (!value || !value.trim()) {
        console.log("\n⚠️  Empty value provided. Using placeholder as-is.");
        replacements[placeholder.original] = placeholder.original;
      } else {
        replacements[placeholder.original] = value.trim();
      }
    }

    rl.close();

    // Replace all placeholders with user values
    let finalCommand = command;
    for (const [placeholder, value] of Object.entries(replacements)) {
      finalCommand = finalCommand.replace(
        new RegExp(escapeRegex(placeholder), "g"),
        value
      );
    }

    console.log("\n✓ Final command:");
    console.log(`  ${finalCommand}\n`);

    return finalCommand;
  } catch (error) {
    rl.close();
    throw error;
  }
}

// Escape special regex characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Check if command has any placeholders
export function hasPlaceholders(command) {
  const placeholders = detectPlaceholders(command);
  return placeholders.length > 0;
}
