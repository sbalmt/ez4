import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';

import { warnUnsupportedFlags } from '../../utils/flags';
import { buildMetadata } from '../../library/metadata';
import { generateResources } from '../../generator/resources';
import { getGeneratorOptions } from '../../generator/options';
import { loadEnvironment } from '../../config/environment';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProviders } from '../../config/providers';

export const generateCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getGeneratorOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths] = await DynamicLogger.logExecution('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadProviders(project)]);
  });

  if (input.environment) {
    loadEnvironment(input.environment);
  }

  warnUnsupportedFlags(input, {
    environment: true,
    arguments: true
  });

  const { metadata } = await DynamicLogger.logExecution('🔄️ Loading metadata', () => {
    return buildMetadata(project.sourceFiles, {
      aliasPaths
    });
  });

  const parameters = input.arguments ?? [];

  await DynamicLogger.logExecution('📦 Generating resources', () => {
    return generateResources(parameters, metadata, options);
  });
};
