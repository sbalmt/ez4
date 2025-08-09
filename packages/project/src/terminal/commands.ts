import type { InputOptions } from './options.js';

import { loadEnvFile } from 'node:process';

import { loadProject } from '../common/project.js';
import { deployCommand } from './commands/deploy.js';
import { destroyCommand } from './commands/destroy.js';
import { serveCommand } from './commands/serve.js';
import { testCommand } from './commands/test.js';
import { helpCommand } from './commands/help.js';
import { CommandType } from './options.js';

export const runActionCommand = async (options: InputOptions) => {
  if (options.environmentFile) {
    loadEnvFile(options.environmentFile);
  }

  const project = await loadProject(options.projectFile);

  project.debugMode = options.debugMode ?? project.debugMode;
  project.forceMode = options.forceMode ?? project.forceMode;

  switch (options.command) {
    case CommandType.Deploy:
      return deployCommand(project);

    case CommandType.Destroy:
      return destroyCommand(project);

    case CommandType.Serve:
      return serveCommand(project);

    case CommandType.Test:
      return testCommand(project);

    case CommandType.Help:
      return helpCommand();
  }
};
