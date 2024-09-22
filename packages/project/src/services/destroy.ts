import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../types/project.js';

import { assertNoErrors } from '../utils/errors.js';
import { applyDeploy } from '../actions/deploy.js';
import { loadState, saveState } from '../actions/state.js';
import { reportResourceChanges } from '../report/report.js';
import { waitConfirmation } from '../console/prompt.js';
import { loadProviders } from './providers.js';

export const destroy = async (project: ProjectOptions) => {
  await loadProviders(project);

  const stateFile = `${project.stateFile.path}.ezstate`;

  const oldState = loadState(stateFile);
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

  saveState(stateFile, applyState.result);

  assertNoErrors(applyState.errors);
};
