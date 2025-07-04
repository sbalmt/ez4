import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../types/project.js';

import { toKebabCase } from '@ez4/utils';

import { applyDeploy } from '../actions/deploy.js';
import { loadLocalState, loadRemoteState, saveLocalState, saveRemoteState } from '../actions/state.js';
import { reportResourceChanges } from '../report/report.js';
import { waitConfirmation } from '../utils/prompt.js';
import { assertNoErrors } from '../utils/errors.js';
import { StateOptions } from '../types/options.js';
import { loadProviders } from './providers.js';
import { Logger } from '../utils/logger.js';

export const destroy = async (project: ProjectOptions) => {
  const options: StateOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    force: project.forceMode,
    debug: project.debugMode
  };

  if (options.force) {
    Logger.log('Force option is enabled');
  }

  await Logger.execute('Loading providers', () => {
    return loadProviders(project);
  });

  const stateFile = project.stateFile;
  const statePath = `${stateFile.path}.ezstate`;

  const oldState = await Logger.execute('Loading state', () => {
    return stateFile.remote ? loadRemoteState(statePath, options) : loadLocalState(statePath);
  });

  const newState: EntryStates = {};
  const hasChanges = await reportResourceChanges(newState, oldState);

  if (!hasChanges) {
    Logger.log('No changes');
    return;
  }

  if (project.confirm !== false) {
    const proceed = await waitConfirmation('Are you sure you want to proceed?');

    if (!proceed) {
      Logger.log('Aborted');
      return;
    }
  }

  const applyState = await applyDeploy(newState, oldState, options.force);

  await Logger.execute('Saving state', () => {
    if (stateFile.remote) {
      return saveRemoteState(statePath, options, applyState.result);
    }

    return saveLocalState(statePath, applyState.result);
  });

  assertNoErrors(applyState.errors);
};
