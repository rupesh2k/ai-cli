#!/usr/bin/env node

import { program } from "commander";
import { runAI } from "../src/llm.js";

program
  .argument("<intent>")
  .action(async (intent) => {
    await runAI(intent);
  });

program.parse();