#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { join } from 'node:path';

import { checkMinNodeVersion } from './terminal/version.js';

checkMinNodeVersion();

const appPath = join(import.meta.dirname, 'app.mjs');
const extPath = join(import.meta.dirname, 'ext.mjs');

spawn('node', ['--experimental-strip-types', '--no-warnings', '--loader', extPath, appPath, ...process.argv.slice(2)], {
  stdio: 'inherit'
});
