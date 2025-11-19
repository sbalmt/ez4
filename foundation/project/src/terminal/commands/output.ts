import type { ProjectOptions } from '../../types/project';

import { Logger } from '@ez4/project/library';

import { loadProviders } from '../../config/providers';
import { printResourcesOutput } from '../../deploy/output';
import { getDeployOptions } from '../../deploy/options';
import { loadState } from '../../utils/state';

export const outputCommand = async (project: ProjectOptions) => {
  const options = getDeployOptions(project);

  await Logger.execute('⚡ Initializing', () => {
    return loadProviders(project);
  });

  const currentState = await Logger.execute('🔄️ Loading state', () => {
    return loadState(project.stateFile, options);
  });

  printResourcesOutput(currentState);
};
