#!/usr/bin/env node
import {Command} from 'commander';
import {listUnusedCommand} from './commands/listUnused.js';
import {removeUnusedCommand} from './commands/removeUnused.js';
import {cleanEmptyCommand} from './commands/cleanEmpty.js';
import {fixJsonCommand} from './commands/fixJson.js';
import {mergeCommand} from './commands/merge.js';
import {readFileSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

// Helper to read package.json version
const __dirname = dirname(fileURLToPath(import.meta.url));
let version = 'unknown';

try {
  // Try to read package.json relative to dist/cli.js -> ../package.json
  const pkgPath = join(__dirname, '../package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  version = pkg.version;
} catch {
  // ignore
}

const program = new Command();

program
  .name('i18next-cleanup')
  .description('i18next cleanup and maintenance tools')
  .version(version);

program.addCommand(listUnusedCommand);
program.addCommand(removeUnusedCommand);
program.addCommand(cleanEmptyCommand);
program.addCommand(fixJsonCommand);
program.addCommand(mergeCommand);

program.parse(process.argv);
