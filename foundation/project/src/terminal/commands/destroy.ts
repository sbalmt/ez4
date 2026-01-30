import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';

import { applyDeploy } from '../../deploy/apply';
import { performDeploy } from '../../deploy/perform';
import { warnUnsupportedFlags } from '../../utils/flags';
import { loadState, saveState } from '../../utils/state';
import { reportResourceChanges } from '../../deploy/changes';
import { getDeployOptions } from '../../deploy/options';
import { loadProviders } from '../../config/providers';
import { waitConfirmation } from '../../utils/prompt';
import { assertNoErrors } from '../../utils/errors';

export const destroyCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getDeployOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  await DynamicLogger.logExecution('⚡ Initializing', () => {
    return loadProviders(project);
  });

  if (options.force) {
    Logger.log('❗ Force option is enabled');
  }

  warnUnsupportedFlags(input, {
    force: true
  });

  const oldState = await loadState(project.stateFile, options);
  const newState: EntryStates = {};

  const hasChanges = await reportResourceChanges(newState, oldState, options);

  if (!hasChanges) {
    return Logger.log('ℹ️  No changes');
  }

  if (project.confirmMode !== false) {
    const canProceed = await waitConfirmation('Are you sure you want to proceed?');

    if (!canProceed) {
      return Logger.log('⛔ Aborted');
    }
  }

  const deployState = await performDeploy(options, async () => {
    const { result, errors } = await applyDeploy(newState, oldState, options);

    await saveState(project.stateFile, options, result);

    return {
      result,
      errors
    };
  });

  assertNoErrors(deployState.errors);
};
