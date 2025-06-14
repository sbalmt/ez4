import type { ApplyResult, EntryState, EntryStates, StepHandler, StepHandlers } from '@ez4/stateful';

import { applySteps, planSteps } from '@ez4/stateful';

import { DuplicateProviderError } from '../errors/providers.js';
import { Logger } from './logger.js';

const allProviderHandlers: StepHandlers<any> = {};

export const registerProvider = <E extends EntryState>(providerName: string, handler: StepHandler<E>) => {
  if (providerName in allProviderHandlers) {
    throw new DuplicateProviderError(providerName);
  }

  allProviderHandlers[providerName] = handler;
};

export const report = <E extends EntryState>(
  newState: EntryStates<E> | undefined,
  oldState: EntryStates<E> | undefined,
  force?: boolean
) => {
  return planSteps(newState, oldState, {
    handlers: allProviderHandlers,
    force
  });
};

export const deploy = async <E extends EntryState>(
  newState: EntryStates<E> | undefined,
  oldState: EntryStates<E> | undefined,
  force?: boolean
): Promise<ApplyResult<E>> => {
  const serviceName = 'EZ4:Deploy';

  Logger.logInfo(serviceName, 'Started');

  const plannedSteps = await planSteps(newState, oldState, {
    handlers: allProviderHandlers,
    force
  });

  const resultState = await applySteps(plannedSteps, newState, oldState, {
    handlers: allProviderHandlers,
    force
  });

  resultState.errors.forEach((error) => {
    Logger.logError('EZ4:Deploy', error.message);
  });

  Logger.logInfo(serviceName, 'Finished');

  return resultState;
};
