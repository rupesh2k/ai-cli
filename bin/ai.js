#!/usr/bin/env node

import { program } from "commander";
import { runAI } from "../src/llm.js";
import { initConfig } from "../src/config.js";

// Main command - run AI with intent
program
  .argument("[intent...]")
  .description("Convert natural language intent to shell commands")
  .option("-d, --dry-run", "Preview the command without executing it")
  .option("-v, --verbose", "Show detailed explanation of what the command does")
  .action(async (intentWords, options) => {
    // If no intent provided, show help
    if (!intentWords || intentWords.length === 0) {
      program.help();
    }

    const intent = intentWords.join(" ");
    await runAI(intent, options);
  });

// Init command - setup configuration
program
  .command("init")
  .description("Initialize AI CLI configuration")
  .action(async () => {
    await initConfig();
  });

program.parse();