import type { EntryStates } from '@ez4/stateful';
import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';

import { applyDeploy } from '../../deploy/apply';
import { performDeploy } from '../../deploy/perform';
import { getEventContext } from '../../deploy/context';
import { prepareExecutionRole } from '../../deploy/identity';
import { prepareLinkedServices } from '../../deploy/services';
import { mergeState, loadState, saveState } from '../../utils/state';
import { connectDeployResources, prepareDeployResources } from '../../deploy/resources';
import { reportResourceChanges } from '../../deploy/changes';
import { reportResourcesOutput } from '../../deploy/output';
import { getDeployOptions } from '../../deploy/options';
import { loadEnvironment } from '../../config/environment';
import { loadReferences } from '../../config/references';
import { loadProviders } from '../../config/providers';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProject } from '../../config/project';
import { buildMetadata } from '../../library/metadata';
import { warnUnsupportedFlags } from '../../utils/flags';
import { waitConfirmation } from '../../utils/prompt';
import { assertNoErrors } from '../../utils/errors';

export const deployCommand = async (input: InputOptions) => {
  const project = await loadProject(input.project);
  const options = getDeployOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths, allImports] = await DynamicLogger.logExecution('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadReferences(project), loadProviders(project)]);
  });

  if (options.force) {
    Logger.log('❗ Force option is enabled');
  }

  if (input.environment) {
    loadEnvironment(input.environment);
  }

  warnUnsupportedFlags(input, {
    environment: true,
    force: true
  });

  options.imports = allImports;

  const [oldState, { metadata, dependencies }] = await DynamicLogger.logExecution('🔄️ Loading metadata and state', () => {
    return Promise.all([
      loadState(project.stateFile, options),
      buildMetadata(project.sourceFiles, {
        aliasPaths
      })
    ]);
  });

  const newState: EntryStates = {};

  const role = await prepareExecutionRole(newState, metadata, options);
  const context = getEventContext(dependencies, role);

  await prepareDeployResources(newState, metadata, context, options);
  await prepareLinkedServices(metadata, context, options);

  await connectDeployResources(newState, metadata, context, options);

  mergeState(newState, oldState);

  const hasChanges = await reportResourceChanges(newState, oldState, options);

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

  const deployState = await performDeploy(options, async () => {
    const { result, errors } = await applyDeploy(newState, oldState, options);

    await DynamicLogger.logExecution('✅ Saving state', () => {
      return saveState(project.stateFile, options, result);
    });

    return {
      result,
      errors
    };
  });

  reportResourcesOutput(deployState.result);
  assertNoErrors(deployState.errors);
};
