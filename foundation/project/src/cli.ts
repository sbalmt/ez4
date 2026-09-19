#!/usr/bin/env node
import * as module from 'node:module';
import * as childProcess from 'node:child_process';
import * as path from 'node:path';

import { CommandType, getInputOptions } from './terminal/options';
import { checkMinNodeVersion } from './terminal/version';

checkMinNodeVersion();

const applicationPath = path.join(import.meta.dirname, './application.mjs');
const extensionsPath = path.join(import.meta.dirname, './extensions.mjs');

const input = getInputOptions();

if (input.coverage || process.env.NODE_V8_COVERAGE) {
  process.env.NODE_DISABLE_COMPILE_CACHE = '1';
} else {
  const cache = module.enableCompileCache();

  if (cache?.directory) {
    process.env.NODE_COMPILE_CACHE = cache.directory;
  }
}

if (input.project) {
  process.env.EZ4_PROJECT_FILE = input.project;
}

const extraArguments = [];

if (input.command === CommandType.Test) {
  extraArguments.push('--experimental-test-module-mocks');

  if (input.coverage) {
    extraArguments.push('--experimental-test-coverage');
  }
}

if (input.command === CommandType.Serve || input.command === CommandType.Test || input.command === CommandType.Run) {
  extraArguments.push('--enable-source-maps');

  if (input.inspect) {
    extraArguments.push('--inspect');
  }
}

const child = childProcess.spawn(
  process.execPath,
  [
    // Invocation options
    '--no-warnings',
    '--experimental-transform-types',

    // Extra arguments
    ...extraArguments,

    // Custom loader options
    '--import',
    extensionsPath,

    // Forward invocation
    applicationPath,
    ...process.argv.slice(2)
  ],
  {
    stdio: 'inherit'
  }
);

const setupShutdown = () => {
  child.removeAllListeners('exit');
  child.once('exit', () => process.exit(child.exitCode));
};

process.on('SIGTERM', setupShutdown);
process.on('SIGINT', setupShutdown);

setupShutdown();
