import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { Logger, LogLevel } from '@ez4/project/library';

import { warnUnsupportedFlags } from '../../utils/flags';
import { buildMetadata } from '../../library/metadata';
import { generateResources } from '../../generator/resources';
import { getGenerateOptions } from '../../generator/options';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProviders } from '../../config/providers';

export const generateCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getGenerateOptions(project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths] = await Logger.execute('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadProviders(project)]);
  });

  warnUnsupportedFlags(input);

  const { metadata } = await Logger.execute('🔄️ Loading metadata', () => {
    return buildMetadata(project.sourceFiles, {
      aliasPaths
    });
  });

  const parameters = input.arguments ?? [];

  await Logger.execute('📦 Generating resources', () => {
    return generateResources(parameters, metadata, options);
  });
};
