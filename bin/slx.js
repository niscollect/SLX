#!/usr/bin/env node
//! Shebang

import { crawl } from "../src/core/crawl.js";

//* argument parsing
const [, , command, ...args] = process.argv;

console.log("command = ", command);

switch (command) {
  case "crawl":
    await crawl(process.cwd());
    break;

  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
