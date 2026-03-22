#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const entryFile = join(__dirname, '../dist/index.js');

const run = async () => {
  try {
    await import(pathToFileURL(entryFile).href);
  } catch (err) {
    console.error('\n❌ Fatal: Could not load Cortex application.');
    console.error(`Reason: ${err.message}`);
    console.error('\nIf you are a developer, try running "pnpm build" first.');
    process.exit(1);
  }
};

run();
