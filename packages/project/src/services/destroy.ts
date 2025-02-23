import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../types/project.js';

import { toKebabCase } from '@ez4/utils';

import {
  loadLocalState,
  loadRemoteState,
  saveLocalState,
  saveRemoteState
} from '../actions/state.js';

import { applyDeploy } from '../actions/deploy.js';
import { reportResourceChanges } from '../report/report.js';
import { waitConfirmation } from '../console/prompt.js';
import { assertNoErrors } from '../utils/errors.js';
import { StateOptions } from '../types/options.js';
import { loadProviders } from './providers.js';

export const destroy = async (project: ProjectOptions) => {
  await loadProviders(project);

  const options: StateOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName)
  };

  const stateFile = project.stateFile;

  const statePath = `${stateFile.path}.ezstate`;

  const oldState = stateFile.remote
    ? await loadRemoteState(statePath, options)
    : await loadLocalState(statePath);

  const newState: EntryStates = {};

  const hasChanges = await reportResourceChanges(newState, oldState);

  if (!hasChanges) {
    console.log('No changes.');
    return;
  }

  if (project.confirm !== false) {
    const proceed = await waitConfirmation('Are you sure to proceed?');

    if (!proceed) {
      console.log('Aborted.');
      return;
    }
  }

  const applyState = await applyDeploy(newState, oldState);

  if (stateFile.remote) {
    await saveRemoteState(statePath, options, applyState.result);
  } else {
    await saveLocalState(statePath, applyState.result);
  }

  assertNoErrors(applyState.errors);
};
