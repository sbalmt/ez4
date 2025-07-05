const { stdout } = process;

export const helpCommand = () => {
  const helpText = [
    'Usage:',
    '  ez4 [command] [options] [ ez4.project.js ]',
    '',
    'Commands:',
    '  deploy   Create and publish all resources for the given project',
    '  destroy  Remove all resources from the last deploy for the given project',
    '  serve    Emulate locally all resources for the given project',
    '  help     Display the command line options',
    '',
    'Options:',
    '  --environment, -e  Specify the environment file',
    '  --project, -p      Specify the project file (Default is ez4.project.js)',
    '  --debug            Enable debug mode on deployed resources',
    '  --force            Force deploy of everything',
    ''
  ];

  stdout.write(helpText.join('\n'));
};
