import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../../types/project';
import type { DestroyOptions } from '../../types/options';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { applyDeploy } from '../../actions/deploy';
import { loadLocalState, loadRemoteState, saveLocalState, saveRemoteState } from '../../actions/state';
import { reportResourceChanges } from '../../report/report';
import { loadProviders } from '../../config/providers';
import { waitConfirmation } from '../../utils/prompt';
import { assertNoErrors } from '../../utils/errors';

export const destroyCommand = async (project: ProjectOptions) => {
  const options: DestroyOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    debug: project.debugMode,
    force: project.forceMode
  };

  if (options.force) {
    Logger.log('‼️  Force option is enabled');
  }

  await Logger.execute('🔄️ Loading providers', () => {
    return loadProviders(project);
  });

  const stateFile = project.stateFile;
  const statePath = `${stateFile.path}.ezstate`;

  const oldState = await Logger.execute('🔄️ Loading state', () => {
    return stateFile.remote ? loadRemoteState(statePath, options) : loadLocalState(statePath);
  });

  const newState: EntryStates = {};
  const hasChanges = await reportResourceChanges(newState, oldState);

  if (!hasChanges) {
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

  await Logger.execute('💾 Saving state', () => {
    if (stateFile.remote) {
      return saveRemoteState(statePath, options, applyState.result);
    }

    return saveLocalState(statePath, applyState.result);
  });

  assertNoErrors(applyState.errors);
};
