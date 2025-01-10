import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../types/project.js';
import type { DeployOptions } from '../types/deploy.js';

import { toKebabCase } from '@ez4/utils';

import { applyDeploy } from '../actions/deploy.js';
import { assertNoErrors } from '../utils/errors.js';
import { prepareAllLinkedServices } from '../actions/services.js';
import { combineStates, loadState, saveState } from '../actions/state.js';
import { connectDeployResources, prepareDeployResources } from '../actions/resources.js';
import { prepareExecutionRole } from '../actions/identity.js';
import { reportResourceChanges } from '../report/report.js';
import { waitConfirmation } from '../console/prompt.js';
import { getMetadata } from '../library/metadata.js';
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

  const stateFile = `${project.stateFile.path}.ezstate`;

  const oldState = loadState(stateFile);
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

  saveState(stateFile, applyState.result);

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
