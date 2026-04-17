import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';

import { warnUnsupportedFlags } from '../../utils/flags';
import { buildMetadata } from '../../library/metadata';
import { generateResources } from '../../generator/resources';
import { getGeneratorOptions } from '../../generator/options';
import { loadEnvironment } from '../../config/environment';
import { loadReferences } from '../../config/references';
import { loadProviders } from '../../config/providers';
import { loadProject } from '../../config/project';
import { loadPaths } from '../../config/tsconfig';

export const generateCommand = async (input: InputOptions) => {
  const project = await loadProject(input.project);
  const options = getGeneratorOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [paths, references] = await DynamicLogger.logExecution('⚡ Initializing', () => {
    return Promise.all([loadPaths(project), loadReferences(project), loadProviders(project)]);
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
      aliasPaths: {
        ...references.paths,
        ...paths
      }
    });
  });

  const parameters = input.arguments ?? [];

  await DynamicLogger.logExecution('📦 Generating resources', () => {
    return generateResources(parameters, metadata, options);
  });
};
