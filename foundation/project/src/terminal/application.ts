import { helpCommand } from './commands/help';
import { runActionCommand } from './commands';
import { getInputOptions } from './options';
import { Logger } from '../utils/logger';

const options = getInputOptions();

try {
  if (options?.command) {
    await runActionCommand(options);
  } else {
    (helpCommand(), process.exit(1));
  }
} catch (error) {
  if (error instanceof Error) {
    Logger.error(error.stack && options?.debugMode ? error.stack : error.message);
  } else {
    Logger.error(`${error}`);
  }

  process.exit(1);
}
