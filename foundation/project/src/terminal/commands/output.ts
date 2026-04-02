import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';

import { loadProject } from '../../config/project';
import { loadProviders } from '../../config/providers';
import { reportResourcesOutput } from '../../deploy/output';
import { getDeployOptions } from '../../deploy/options';
import { warnUnsupportedFlags } from '../../utils/flags';
import { loadState } from '../../utils/state';

export const outputCommand = async (input: InputOptions) => {
  const project = await loadProject(input.project);
  const options = getDeployOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  await DynamicLogger.logExecution('⚡ Initializing', () => {
    return loadProviders(project);
  });

  warnUnsupportedFlags(input);

  const currentState = await DynamicLogger.logExecution('🔄️ Loading state', () => {
    return loadState(project.stateFile, options);
  });

  reportResourcesOutput(currentState);
};
