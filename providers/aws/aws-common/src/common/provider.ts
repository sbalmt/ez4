import type { ApplyResult, EntryState, EntryStates, StepHandler, StepHandlers } from '@ez4/stateful';

import { applySteps, planSteps } from '@ez4/stateful';
import { Logger } from '@ez4/logger';

import { DuplicateProviderError } from '../errors/providers';
import { OperationLogger } from './logger';

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

  const startTime = performance.now();

  const plannedSteps = await planSteps(newState, oldState, {
    handlers: allProviderHandlers,
    force
  });

  const resultState = await applySteps(plannedSteps, newState, oldState, {
    handlers: allProviderHandlers,
    concurrency,
    force,
    onProgress: (applied, total) => {
      OperationLogger.setStats(`  ${((100 / total) * applied).toFixed(2)}%`);
    }
  });

  const elapsedTime = ((performance.now() - startTime) / 1000).toFixed(2);

  Logger.log(`ℹ️  Deploy finished (${plannedSteps.length} steps in ${elapsedTime}s)`);

  return resultState;
};
