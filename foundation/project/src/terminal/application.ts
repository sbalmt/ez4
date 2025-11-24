import { loadEnvFile } from 'node:process';

import { Logger } from '../utils/logger';
import { loadProject } from '../config/project';
import { helpCommand } from './commands/help';
import { runActionCommand } from './commands';
import { getInputOptions } from './options';

const input = getInputOptions();

try {
  if (input?.environmentFile) {
    loadEnvFile(input.environmentFile);
  }

  const project = await loadProject(input?.projectFile);

  if (input?.command) {
    await runActionCommand(input, project);
  } else {
    helpCommand(input, project);
    process.exit(1);
  }
} catch (error) {
  if (error instanceof Error) {
    Logger.error(error.stack && input?.debugMode ? error.stack : error.message);
  } else {
    Logger.error(`${error}`);
  }

  process.exit(1);
}
