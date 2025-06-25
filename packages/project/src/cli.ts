#!/usr/bin/env node
import { checkMinNodeVersion, suppressNodeWarning } from './terminal/utils.js';
import { runActionCommand, runHelpCommand } from './terminal/commands.js';
import { CommandType, getInputOptions } from './terminal/options.js';
import { Logger } from './utils/logger.js';

checkMinNodeVersion();
suppressNodeWarning();

const options = getInputOptions();

try {
  switch (options?.command) {
    case CommandType.Deploy:
    case CommandType.Destroy: {
      await runActionCommand(options);
      break;
    }

    default: {
      runHelpCommand();

      if (options?.command !== CommandType.Help) {
        process.exit(1);
      }

      break;
    }
  }
} catch (error) {
  if (error instanceof Error && error.stack && options?.debugMode) {
    Logger.error(error.stack);
  } else {
    Logger.error(`${error}`);
  }

  process.exit(1);
}
