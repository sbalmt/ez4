import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../types/project.js';
import type { DeployOptions } from '../types/options.js';

import { toKebabCase } from '@ez4/utils';

import {
  combineStates,
  loadRemoteState,
  loadLocalState,
  saveRemoteState,
  saveLocalState
} from '../actions/state.js';

import { applyDeploy } from '../actions/deploy.js';
import { prepareExecutionRole } from '../actions/identity.js';
import { prepareAllLinkedServices } from '../actions/services.js';
import { connectDeployResources, prepareDeployResources } from '../actions/resources.js';
import { reportResourceChanges } from '../report/report.js';
import { waitConfirmation } from '../console/prompt.js';
import { getMetadata } from '../library/metadata.js';
import { assertNoErrors } from '../utils/errors.js';
import { loadProviders } from './providers.js';
import { loadProject } from './project.js';

export const deploy = async (project: ProjectOptions) => {
  await loadProviders(project);

  const metadata = getMetadata(project.sourceFiles);

  const options: DeployOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    imports: await loadImports(project),
    debug: project.debugMode
  };

  const stateFile = project.stateFile;

  const statePath = `${stateFile.path}.ezstate`;

  const oldState = stateFile.remote
    ? await loadRemoteState(statePath, options)
    : await loadLocalState(statePath);

  const newState: EntryStates = {};

  await prepareAllLinkedServices(metadata, options);

  const role = await prepareExecutionRole(newState, options);

  await prepareDeployResources(newState, metadata, role, options);
  await connectDeployResources(newState, metadata, role, options);

  combineStates(newState, oldState);

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

const loadImports = async (projectOptions: ProjectOptions) => {
  const importProjects = projectOptions.importProjects;

  if (!importProjects) {
    return undefined;
  }

  const allImports: Record<string, DeployOptions> = {};

  for (const alias in importProjects) {
    const { projectFile } = importProjects[alias];

    const project = await loadProject(projectFile);

    allImports[alias] = {
      resourcePrefix: project.prefix ?? 'ez4',
      projectName: toKebabCase(project.projectName)
    };
  }

  return allImports;
};
