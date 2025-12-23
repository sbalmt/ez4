export const enum CommandType {
  Deploy = 'deploy',
  Destroy = 'destroy',
  Output = 'output',
  Generate = 'generate',
  Run = 'run',
  Serve = 'serve',
  Test = 'test',
  Help = 'help'
}

export type InputOptions = {
  command?: CommandType;
  environmentFile?: string;
  projectFile?: string;
  arguments?: string[];
  suppress?: boolean;
  force?: boolean;
  inspect?: boolean;
  debug?: boolean;
  reset?: boolean;
  local?: boolean;
};

export const getInputOptions = () => {
  const options: InputOptions = {};
  const input = process.argv.slice(2);

  for (let index = 0; index < input.length; index++) {
    const argument = input[index];

    switch (argument) {
      case CommandType.Deploy:
      case CommandType.Destroy:
      case CommandType.Output:
      case CommandType.Generate:
      case CommandType.Run:
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

      case '--suppress':
        options.suppress = true;
        break;

      case '--force':
        options.force = true;
        break;

      case '--inspect':
        options.inspect = true;
        break;

      case '--debug':
        options.debug = true;
        break;

      case '--reset':
        options.reset = true;
        break;

      case '--local':
        options.local = true;
        break;

      case '--':
        options.arguments = input.slice(++index);
        break;
    }
  }

  return options;
};
