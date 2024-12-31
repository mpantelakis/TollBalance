#!/usr/bin/env node

import { program } from "commander";
import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Resolve directory for commands folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, "commands");

program
  .name("se2408")
  .description(
    "Command-Line Interface (CLI) for managing and querying toll station data and administrative operations through the Express.js backend API."
  )
  .version("1.0.0");

// Dynamically load commands
const loadCommands = async () => {
  const files = await readdir(commandsPath);
  for (const file of files) {
    if (file.endsWith(".js")) {
      const { default: command } = await import(path.join(commandsPath, file));
      program.addCommand(command);
    }
  }
};

await loadCommands();

program.parse(process.argv);
