import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../types/project.js';
import type { DeployOptions } from '../types/options.js';

import { toKebabCase } from '@ez4/utils';

import { applyDeploy } from '../actions/deploy.js';
import { getEventContext } from '../actions/common.js';
import { prepareExecutionRole } from '../actions/identity.js';
import { prepareLinkedServices } from '../actions/services.js';
import { combineStates, loadRemoteState, loadLocalState, saveRemoteState, saveLocalState } from '../actions/state.js';
import { connectDeployResources, prepareDeployResources } from '../actions/resources.js';
import { reportResourceChanges } from '../report/report.js';
import { waitConfirmation } from '../console/prompt.js';
import { getMetadata } from '../library/metadata.js';
import { assertNoErrors } from '../utils/errors.js';
import { loadProviders } from './providers.js';
import { loadProject } from './project.js';

export const deploy = async (project: ProjectOptions) => {
  console.log('[EZ4]: Loading providers');

  await loadProviders(project);

  console.log('[EZ4]: Loading metadata');

  const { metadata, dependencies } = getMetadata(project.sourceFiles);

  const options: DeployOptions = {
    resourcePrefix: toKebabCase(project.prefix ?? 'ez4'),
    projectName: toKebabCase(project.projectName),
    imports: await loadImports(project),
    variables: project.variables,
    debug: project.debugMode,
    force: project.forceMode,
    tags: project.tags
  };

  const stateFile = project.stateFile;
  const statePath = `${stateFile.path}.ezstate`;

  if (options.force) {
    console.info('[EZ4]: Force option enabled.');
  }

  console.log('[EZ4]: Loading state');

  const oldState = await (stateFile.remote ? loadRemoteState(statePath, options) : loadLocalState(statePath));

  const newState: EntryStates = {};

  const role = await prepareExecutionRole(newState, metadata, options);
  const context = getEventContext(dependencies, role);

  await prepareDeployResources(newState, metadata, context, options);
  await prepareLinkedServices(metadata, context, options);

  await connectDeployResources(newState, metadata, context, options);

  combineStates(newState, oldState);

  const hasChanges = await reportResourceChanges(newState, oldState, options.force);

  if (!hasChanges && !options.force) {
    console.info('[EZ4]: No changes.');
    return;
  }

  if (project.confirm !== false) {
    const proceed = await waitConfirmation('[EZ4]: Are you sure to proceed?');

    if (!proceed) {
      console.info('[EZ4]: Aborted.');
      return;
    }
  }

  const applyState = await applyDeploy(newState, oldState, options.force);

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
