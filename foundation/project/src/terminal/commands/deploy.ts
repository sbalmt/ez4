import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../../types/project';
import type { DeployOptions } from '../../types/options';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { applyDeploy } from '../../actions/deploy';
import { getEventContext } from '../../actions/common';
import { prepareExecutionRole } from '../../actions/identity';
import { prepareLinkedServices } from '../../actions/services';
import { mergeState, loadState, saveState } from '../../actions/state';
import { connectDeployResources, prepareDeployResources } from '../../actions/resources';
import { reportResourceChanges } from '../../report/report';
import { loadProviders } from '../../config/providers';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadImports } from '../../config/imports';
import { waitConfirmation } from '../../utils/prompt';
import { buildMetadata } from '../../library/metadata';
import { assertNoErrors } from '../../utils/errors';

export const deployCommand = async (project: ProjectOptions) => {
  const options: DeployOptions = {
    resourcePrefix: toKebabCase(project.prefix ?? 'ez4'),
    projectName: toKebabCase(project.projectName),
    variables: project.variables,
    debug: project.debugMode,
    force: project.forceMode,
    tags: project.tags
  };

  if (options.force) {
    Logger.log('‼️  Force option is enabled');
  }

  const [aliasPaths, allImports] = await Logger.execute('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadImports(project), loadProviders(project)]);
  });

  options.imports = allImports;

  const { metadata, dependencies } = await Logger.execute('🔄️ Loading metadata', () => {
    return buildMetadata(project.sourceFiles, {
      aliasPaths
    });
  });

  const oldState = await Logger.execute('🔄️ Loading state', () => {
    return loadState(project.stateFile, options);
  });

  const newState: EntryStates = {};

  const role = await prepareExecutionRole(newState, metadata, options);
  const context = getEventContext(dependencies, role);

  await prepareDeployResources(newState, metadata, context, options);
  await prepareLinkedServices(metadata, context, options);

  await connectDeployResources(newState, metadata, context, options);

  mergeState(newState, oldState);

  const hasChanges = await reportResourceChanges(newState, oldState, options.force);

  if (!hasChanges && !options.force) {
    Logger.log('ℹ️  No changes');
    return;
  }

  if (project.confirmMode !== false) {
    const proceed = await waitConfirmation('⁉️  Are you sure you want to proceed?');

    if (!proceed) {
      Logger.log('⛔ Aborted');
      return;
    }
  }

  const applyState = await applyDeploy(newState, oldState, options.force);

  await Logger.execute('✅ Saving state', () => {
    return saveState(project.stateFile, options, applyState.result);
  });

  assertNoErrors(applyState.errors);
};
