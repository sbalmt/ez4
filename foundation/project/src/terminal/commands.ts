import type { ProjectOptions } from '../types/project';
import type { InputOptions } from './options';

import { deployCommand } from './commands/deploy';
import { destroyCommand } from './commands/destroy';
import { outputCommand } from './commands/output';
import { generateCommand } from './commands/generate';
import { runCommand } from './commands/run';
import { serveCommand } from './commands/serve';
import { testCommand } from './commands/test';
import { helpCommand } from './commands/help';
import { CommandType } from './options';

export const runActionCommand = async (input: InputOptions, project: ProjectOptions) => {
  switch (input.command) {
    case CommandType.Deploy:
      return deployCommand(input, project);

    case CommandType.Destroy:
      return destroyCommand(input, project);

    case CommandType.Output:
      return outputCommand(input, project);

    case CommandType.Generate:
      return generateCommand(input, project);

    case CommandType.Run:
      return runCommand(input, project);

    case CommandType.Serve:
      return serveCommand(input, project);

    case CommandType.Test:
      return testCommand(input, project);

    case CommandType.Help:
      return helpCommand(input, project);
  }
};
