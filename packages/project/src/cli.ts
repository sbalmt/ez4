#!/usr/bin/env node
import { runActionCommand, runHelpCommand } from './terminal/commands.js';
import { checkMinNodeVersion, suppressNodeWarning } from './terminal/utils.js';
import { getInputOptions } from './terminal/options.js';
import { Logger } from './utils/logger.js';

checkMinNodeVersion();
suppressNodeWarning();

const options = getInputOptions();

try {
  if (options?.command) {
    await runActionCommand(options);
  } else {
    runHelpCommand();
    process.exit(1);
  }
} catch (error) {
  if (error instanceof Error && error.stack && options?.debugMode) {
    Logger.error(error.stack);
  } else {
    Logger.error(`${error}`);
  }

  process.exit(1);
}
