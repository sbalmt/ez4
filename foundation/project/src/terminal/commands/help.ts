import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { warnUnsupportedFlags } from '../../utils/flags';
import { Logger } from '../../utils/logger';
import { toBold } from '../../utils/format';

export const helpCommand = (input: InputOptions, _project: ProjectOptions) => {
  const helpText = [
    toBold('Usage:'),
    '  ez4 [command] [options] [ -p ez4.project.js ] [ -- arguments ]',
    '',
    toBold('Commands:'),
    '  deploy    Create and publish all resources for the given project',
    '  destroy   Remove all resources from the last deploy for the given project',
    '  output    Display the last deploy output for the given project',
    '  generate  Generate custom resources for the given project',
    '  run       Execute script files for the given project',
    '  serve     Emulate all resources for the given project',
    '  test      Run test suites for the given project',
    '  help      Display the command line options',
    '',
    toBold('Options:'),
    '  --                 Specify test patterns, scripts to run, or generator arguments',
    '  --project, -p      Specify the project configuration file (Default is ez4.project.js)',
    '  --environment, -e  Specify the environment variables file to load',
    '  --force            Force deployment or destruction of resources',
    '  --debug            Enable debug mode on all provider resources',
    '  --reset            Reset local resources when serving or testing',
    '  --local            Use local options when serving or testing'
  ];

  helpText.forEach((line) => Logger.log(line));

  Logger.log('');

  if (warnUnsupportedFlags(input)) {
    Logger.log('');
  }
};
