import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { Logger, LogLevel } from '@ez4/project/library';

import { applyDeploy } from '../../deploy/apply';
import { getEventContext } from '../../deploy/context';
import { prepareExecutionRole } from '../../deploy/identity';
import { prepareLinkedServices } from '../../deploy/services';
import { mergeState, loadState, saveState } from '../../utils/state';
import { connectDeployResources, prepareDeployResources } from '../../deploy/resources';
import { reportResourceChanges } from '../../deploy/changes';
import { reportResourcesOutput } from '../../deploy/output';
import { getDeployOptions } from '../../deploy/options';
import { loadProviders } from '../../config/providers';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadImports } from '../../config/imports';
import { buildMetadata } from '../../library/metadata';
import { warnUnsupportedFlags } from '../../utils/flags';
import { waitConfirmation } from '../../utils/prompt';
import { assertNoErrors } from '../../utils/errors';

export const deployCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getDeployOptions(project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths, allImports] = await Logger.execute('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadImports(project), loadProviders(project)]);
  });

  if (options.force) {
    Logger.log('‼️  Force option is enabled');
  }

  warnUnsupportedFlags(input, {
    force: true
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

    reportResourcesOutput(newState);
    return;
  }

  if (project.confirmMode !== false) {
    const canProceed = await waitConfirmation('Are you sure you want to proceed?');

    if (!canProceed) {
      return Logger.log('⛔ Aborted');
    }
  }

  const deployState = await applyDeploy(newState, oldState, options.force);

  await Logger.execute('✅ Saving state', () => {
    return saveState(project.stateFile, options, deployState.result);
  });

  reportResourcesOutput(deployState.result);

  assertNoErrors(deployState.errors);
};
