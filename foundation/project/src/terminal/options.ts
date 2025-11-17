export const enum CommandType {
  Deploy = 'deploy',
  Destroy = 'destroy',
  Serve = 'serve',
  Test = 'test',
  Help = 'help'
}

export type InputOptions = {
  command: CommandType;
  environmentFile?: string;
  projectFile?: string;
  forceMode?: boolean;
  debugMode?: boolean;
  resetMode?: boolean;
  localMode?: boolean;
  arguments?: string;
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
      case CommandType.Test:
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

      case '--force':
        options.forceMode = true;
        break;

      case '--debug':
        options.debugMode = true;
        break;

      case '--reset':
        options.resetMode = true;
        break;

      case '--local':
        options.localMode = true;
        break;

      case '--':
        options.arguments = input[++index];
        break;
    }
  }

  if (!isInputOptions(options)) {
    return null;
  }

  return options;
};
