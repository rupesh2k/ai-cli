#!/usr/bin/env node

import { program } from "commander";
import { runAI } from "../src/llm.js";
import { initConfig } from "../src/config.js";

// Main command - run AI with intent
program
  .argument("[intent...]")
  .description("Convert natural language intent to shell commands")
  .action(async (intentWords) => {
    // If no intent provided, show help
    if (!intentWords || intentWords.length === 0) {
      program.help();
    }

    const intent = intentWords.join(" ");
    await runAI(intent);
  });

// Init command - setup configuration
program
  .command("init")
  .description("Initialize AI CLI configuration")
  .action(async () => {
    await initConfig();
  });

program.parse();