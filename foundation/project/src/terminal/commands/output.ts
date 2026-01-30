import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';

import { warnUnsupportedFlags } from '../../utils/flags';
import { loadProviders } from '../../config/providers';
import { reportResourcesOutput } from '../../deploy/output';
import { getDeployOptions } from '../../deploy/options';
import { loadState } from '../../utils/state';

export const outputCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getDeployOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  await DynamicLogger.logExecution('⚡ Initializing', () => {
    return loadProviders(project);
  });

  warnUnsupportedFlags(input);

  const currentState = await loadState(project.stateFile, options);

  reportResourcesOutput(currentState);
};
