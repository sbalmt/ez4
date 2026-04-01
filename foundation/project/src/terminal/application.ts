import { Logger } from '@ez4/logger';

import { loadProject } from '../config/project';

import { helpCommand } from './commands/help';
import { runActionCommand } from './commands';
import { getInputOptions } from './options';

const input = getInputOptions();

try {
  const project = await loadProject(input?.projectFile);

  if (input?.command) {
    await runActionCommand(input, project);
  } else {
    await helpCommand(input, project);
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
