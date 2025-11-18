import type { EntryStates } from '@ez4/stateful';
import type { ProjectOptions } from '../../types/project';
import type { DestroyOptions } from '../../types/options';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { applyDeploy } from '../../actions/deploy';
import { loadState, saveState } from '../../actions/state';
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

  await Logger.execute('⚡ Initializing', () => {
    return loadProviders(project);
  });

  const oldState = await Logger.execute('🔄️ Loading state', () => {
    return loadState(project.stateFile, options);
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

  await Logger.execute('✅ Saving state', () => {
    return saveState(project.stateFile, options, applyState.result);
  });

  assertNoErrors(applyState.errors);
};
