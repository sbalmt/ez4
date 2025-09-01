#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { join } from 'node:path';

import { checkMinNodeVersion } from './terminal/version';

checkMinNodeVersion();

const applicationPath = join(import.meta.dirname, './application.mjs');
const extensionsPath = join(import.meta.dirname, './extensions.mjs');

spawn(
  'node',
  [
    // Enforce options
    '--experimental-strip-types',
    '--experimental-transform-types',
    '--enable-source-maps',
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
