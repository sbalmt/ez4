import type { InputOptions } from './options';

import { loadEnvFile } from 'node:process';

import { loadProject } from '../common/project';
import { deployCommand } from './commands/deploy';
import { destroyCommand } from './commands/destroy';
import { serveCommand } from './commands/serve';
import { testCommand } from './commands/test';
import { helpCommand } from './commands/help';
import { CommandType } from './options';

export const runActionCommand = async (options: InputOptions) => {
  if (options.environmentFile) {
    loadEnvFile(options.environmentFile);
  }

  const project = await loadProject(options.projectFile);

  project.debugMode = options.debugMode ?? project.debugMode;
  project.forceMode = options.forceMode ?? project.forceMode;
  project.localMode = options.localMode ?? project.localMode;

  switch (options.command) {
    case CommandType.Deploy:
      return deployCommand(project);

    case CommandType.Destroy:
      return destroyCommand(project);

    case CommandType.Serve:
      return serveCommand(project);

    case CommandType.Test:
      return testCommand(options, project);

    case CommandType.Help:
      return helpCommand();
  }
};
