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

export const runActionCommand = async (input: InputOptions) => {
  switch (input.command) {
    case CommandType.Deploy:
      return deployCommand(input);

    case CommandType.Destroy:
      return destroyCommand(input);

    case CommandType.Output:
      return outputCommand(input);

    case CommandType.Generate:
      return generateCommand(input);

    case CommandType.Run:
      return runCommand(input);

    case CommandType.Serve:
      return serveCommand(input);

    case CommandType.Test:
      return testCommand(input);

    case CommandType.Help:
      return helpCommand(input);
  }
};
