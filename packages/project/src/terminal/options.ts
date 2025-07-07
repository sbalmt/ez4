export const enum CommandType {
  Deploy = 'deploy',
  Destroy = 'destroy',
  Serve = 'serve',
  Help = 'help'
}

export type InputOptions = {
  command: CommandType;
  environmentFile?: string;
  projectFile?: string;
  debugMode?: boolean;
  forceMode?: boolean;
};

export const isInputOptions = (options: Partial<InputOptions>): options is InputOptions => {
  return !!options.command;
};

export const getInputOptions = () => {
  const options: Partial<InputOptions> = {};
  const input = process.argv.slice(2);

  for (let index = 0; index < input.length; index++) {
    const argument = input[index];

    switch (argument) {
      case CommandType.Deploy:
      case CommandType.Destroy:
      case CommandType.Serve:
      case CommandType.Help:
        options.command = argument;
        break;

      case '--environment':
      case '-e':
        options.environmentFile = input[++index];
        break;

      case '--project':
      case '-p':
        options.projectFile = input[++index];
        break;

      case '--debug':
        options.debugMode = true;
        break;

      case '--force':
        options.forceMode = true;
        break;
    }
  }

  if (!isInputOptions(options)) {
    return null;
  }

  return options;
};
