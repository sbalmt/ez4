import { loadEnvFile } from 'node:process';

import { Logger } from '@ez4/logger';

import { tryLoadProject } from '../config/project';
import { helpCommand } from './commands/help';
import { runActionCommand } from './commands';
import { getInputOptions } from './options';

const input = getInputOptions();

try {
  if (input?.environmentFile) {
    loadEnvFile(input.environmentFile);
  }

  const project = await tryLoadProject(input?.projectFile);

  if (input?.command) {
    await runActionCommand(input, project);
  } else {
    await helpCommand(input, project);
    process.exit(1);
  }
} catch (error) {
  if (error instanceof Error) {
    Logger.error(error.stack && input?.debug ? error.stack : error.message);
  } else {
    Logger.error(`${error}`);
  }

  process.exit(1);
}
