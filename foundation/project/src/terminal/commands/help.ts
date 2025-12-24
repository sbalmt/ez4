import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { loadProviders } from '../../config/providers';
import { warnUnsupportedFlags } from '../../utils/flags';
import { getGeneratorOptions } from '../../generator/options';
import { getGeneratorsUsageHelp } from '../../generator/help';
import { Logger } from '../../utils/logger';
import { toBold } from '../../utils/format';

const HELP_LINES = [
  toBold('Usage:'),
  '  ez4 [command] [options] [ -p ez4.project.js ] [ -- arguments ]',
  '',
  toBold('Commands:'),
  '  deploy    Create and publish all resources for the given project',
  '  destroy   Remove all resources from the last deploy for the given project',
  '  output    Display the last deploy output for the given project',
  '  generate  Execute a generator action for the given project',
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
  '  --debug            Enable debug mode for all provider resources',
  '  --suppress         Suppress local resource emulation when serving',
  '  --inspect          Enable inspect mode when serving, running, or testing',
  '  --reset            Reset local resources when serving, running, or testing',
  '  --local            Use local options when serving or testing',
  ''
];

export const helpCommand = async (input: InputOptions, project: ProjectOptions) => {
  HELP_LINES.forEach((line) => Logger.log(line));

  await generatorsHelp(input, project);

  if (warnUnsupportedFlags(input)) {
    Logger.log('');
  }
};

const generatorsHelp = async (input: InputOptions, project: ProjectOptions) => {
  await loadProviders(project);

  const options = getGeneratorOptions(input, project);
  const helps = getGeneratorsUsageHelp(options);

  const helpLines = [];

  for (const { arguments: inputs, description } of helps) {
    const helpEntries = [];

    for (let index = 0; index < inputs.length; ++index) {
      const maxLength = Math.max(...helps.map((help) => help.arguments[index]?.length ?? -1));
      const helpEntry = inputs[index].padEnd(maxLength);

      helpEntries.push(helpEntry);
    }

    if (helpEntries.length) {
      helpLines.push(`  ${helpEntries.join(' ')} - ${description}`);
    }
  }

  if (helpLines.length) {
    Logger.log(toBold('Generators:'));

    helpLines.forEach((line) => Logger.log(line));

    Logger.log('');
  }
};
