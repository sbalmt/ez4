import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../types/project.js';
import type { DeployOptions } from '../types/deploy.js';

import { toKebabCase } from '@ez4/utils';

import { assertNoErrors } from '../utils/errors.js';
import { applyDeploy } from '../actions/deploy.js';
import { loadState, saveState } from '../actions/state.js';
import { prepareAllLinkedServices } from '../actions/services.js';
import { prepareDeployResources } from '../actions/resources.js';
import { prepareExecutionRole } from '../actions/identity.js';
import { reportResourceChanges } from '../report/report.js';
import { waitConfirmation } from '../console/prompt.js';
import { getMetadata } from './metadata.js';

export const deploy = async (options: ProjectOptions) => {
  const metadata = getMetadata(options.sourceFiles);

  const deploy: DeployOptions = {
    resourcePrefix: options.resourcePrefix ?? 'ez4',
    projectName: toKebabCase(options.projectName)
  };

  await prepareAllLinkedServices(metadata, deploy);

  const stateFile = `${options.stateFile}.ezstate`;

  const oldState = loadState(stateFile);
  const newState: EntryStates = {};

  const role = await prepareExecutionRole(newState, deploy);

  await prepareDeployResources(newState, oldState, metadata, role, deploy);

  const hasChanges = await reportResourceChanges(newState, oldState);

  if (!hasChanges) {
    console.log('No changes.');
    return;
  }

  if (options.confirmDeploy !== false) {
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
