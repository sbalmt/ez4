#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { join } from 'node:path';

import { checkMinNodeVersion } from './terminal/version.js';

checkMinNodeVersion();

const applicationPath = join(import.meta.dirname, 'app.mjs');
const extensionsPath = join(import.meta.dirname, 'ext.mjs');

spawn(
  'node',
  [
    // Enforce options
    '--experimental-strip-types',
    '--experimental-transform-types',
    '--no-warnings',

    // Handle file extensions
    '--loader',
    extensionsPath,

    // Forward invocation
    applicationPath,
    ...process.argv.slice(2)
  ],
  {
    stdio: 'inherit'
  }
);
