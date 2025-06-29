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
import { waitConfirmation } from '../utils/prompt.js';
import { getMetadata } from '../library/metadata.js';
import { assertNoErrors } from '../utils/errors.js';
import { loadProviders } from './providers.js';
import { loadProject } from './project.js';
import { Logger } from '../utils/logger.js';

export const deploy = async (project: ProjectOptions) => {
  const options: DeployOptions = {
    resourcePrefix: toKebabCase(project.prefix ?? 'ez4'),
    projectName: toKebabCase(project.projectName),
    variables: project.variables,
    debug: project.debugMode,
    force: project.forceMode,
    tags: project.tags
  };

  if (options.force) {
    Logger.log('Force option is enabled');
  }

  await Logger.execute('Loading providers', () => {
    return loadProviders(project);
  });

  const { metadata, dependencies } = await Logger.execute('Loading metadata', () => {
    return getMetadata(project.sourceFiles);
  });

  options.imports = await Logger.execute('Loading imports', () => {
    return loadImports(project);
  });

  const stateFile = project.stateFile;
  const statePath = `${stateFile.path}.ezstate`;

  const oldState = await Logger.execute('Loading state', () => {
    if (stateFile.remote) {
      return loadRemoteState(statePath, options);
    }

    return loadLocalState(statePath);
  });

  const newState: EntryStates = {};

  const role = await prepareExecutionRole(newState, metadata, options);
  const context = getEventContext(dependencies, role);

  await prepareDeployResources(newState, metadata, context, options);
  await prepareLinkedServices(metadata, context, options);

  await connectDeployResources(newState, metadata, context, options);

  combineStates(newState, oldState);

  const hasChanges = await reportResourceChanges(newState, oldState, options.force);

  if (!hasChanges && !options.force) {
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

const loadImports = async (projectOptions: ProjectOptions) => {
  const { importProjects } = projectOptions;

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
