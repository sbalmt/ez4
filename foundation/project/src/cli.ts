#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { join } from 'node:path';

import { CommandType, getInputOptions } from './terminal/options';
import { checkMinNodeVersion } from './terminal/version';

checkMinNodeVersion();

const applicationPath = join(import.meta.dirname, './application.mjs');
const extensionsPath = join(import.meta.dirname, './extensions.mjs');

const options = getInputOptions();

if (options?.projectFile) {
  process.env.EZ4_PROJECT_FILE = options?.projectFile;
}

const allArguments = [];

if (options?.command === CommandType.Serve || options?.command === CommandType.Test) {
  allArguments.push(
    // Test and Serve options
    '--experimental-strip-types',
    '--experimental-transform-types',
    '--experimental-test-module-mocks',
    '--enable-source-maps',

    // Custom loader options
    '--loader',
    extensionsPath
  );
}

spawn(
  'node',
  [
    // Invocation options
    '--no-warnings',
    ...allArguments,

    // Forward invocation
    applicationPath,
    ...process.argv.slice(2)
  ],
  {
    stdio: 'inherit'
  }
);
