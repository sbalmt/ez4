import { runActionCommand, runHelpCommand } from './commands.js';
import { getInputOptions } from './options.js';
import { Logger } from '../utils/logger.js';

const options = getInputOptions();

try {
  if (options?.command) {
    await runActionCommand(options);
  } else {
    runHelpCommand(), process.exit(1);
  }
} catch (error) {
  if (error instanceof Error && error.stack && options?.debugMode) {
    Logger.error(error.stack);
  } else {
    Logger.error(`${error}`);
  }

  process.exit(1);
}
