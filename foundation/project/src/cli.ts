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

const extraArguments = [];

if (options?.command === CommandType.Test) {
  extraArguments.push('--experimental-test-module-mocks');

  if (options.coverage) {
    extraArguments.push('--experimental-test-coverage', `--test-coverage-include=${process.cwd()}/**/*`);
  }
}

if (options?.command === CommandType.Serve || options?.command === CommandType.Test || options?.command === CommandType.Run) {
  extraArguments.push('--enable-source-maps');

  if (options.inspect) {
    extraArguments.push('--inspect');
  }
}

spawn(
  'node',
  [
    // Invocation options
    '--no-warnings',
    '--experimental-strip-types',
    '--experimental-transform-types',

    // Extra arguments
    ...extraArguments,

    // Custom loader options
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
