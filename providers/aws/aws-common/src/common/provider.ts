import type { ApplyResult, EntryState, EntryStates, StepHandler, StepHandlers } from '@ez4/stateful';

import { applySteps, planSteps } from '@ez4/stateful';
import { Logger } from '@ez4/project/library';

import { DuplicateProviderError } from '../errors/providers';

const allProviderHandlers: StepHandlers<any> = {};

export const registerProvider = <E extends EntryState>(providerName: string, handler: StepHandler<E>) => {
  if (providerName in allProviderHandlers) {
    throw new DuplicateProviderError(providerName);
  }

  allProviderHandlers[providerName] = handler;
};

export const tryRegisterProvider = <E extends EntryState>(providerName: string, handler: StepHandler<E>) => {
  if (!(providerName in allProviderHandlers)) {
    allProviderHandlers[providerName] = handler;
  }
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
  concurrency?: number,
  force?: boolean
): Promise<ApplyResult<E>> => {
  Logger.log(`🚀 Deploy started`);

  const plannedSteps = await planSteps(newState, oldState, {
    handlers: allProviderHandlers,
    force
  });

  const resultState = await applySteps(plannedSteps, newState, oldState, {
    handlers: allProviderHandlers,
    batchSize: concurrency,
    force
  });

  Logger.log(`ℹ️  Deploy finished`);

  return resultState;
};
