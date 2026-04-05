import { Logger } from '@ez4/logger';

import { helpCommand } from './commands/help';
import { runActionCommand } from './commands';
import { getInputOptions } from './options';

const input = getInputOptions();

try {
  if (input.command) {
    await runActionCommand(input);
  } else {
    await helpCommand(input);
    process.exit(1);
  }
} catch (error) {
  Logger.space();

  if (error instanceof Error) {
    Logger.error(error.stack && input?.debug ? error.stack : error.message);
  } else {
    Logger.error(`${error}`);
  }

  process.exit(1);
}
