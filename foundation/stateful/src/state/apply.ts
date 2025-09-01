import type { EntryState, EntryStates } from '../types/entry';
import type { StepHandlers, StepState } from '../types/step';

import { HandlerNotFoundError, EntriesNotFoundError } from './errors';
import { getDependencies, getEntry } from './entry';
import { StepAction } from './step';

export type ApplyResult<E extends EntryState = EntryState> = {
  result: EntryStates<E>;
  errors: Error[];
};

export type ApplyOptions<E extends EntryState> = {
  handlers: StepHandlers<E>;
  batchSize?: number;
  force?: boolean;
};

export const applySteps = async <E extends EntryState>(
  stepList: StepState[],
  newEntries: EntryStates<E> | undefined,
  oldEntries: EntryStates<E> | undefined,
  options: ApplyOptions<E>
): Promise<ApplyResult<E>> => {
  if (!newEntries && !oldEntries) {
    throw new EntriesNotFoundError();
  }

  const tmpEntries: EntryStates<E> = {};
  const errorList: Error[] = [];

  const { handlers, batchSize = 10, force = false } = options;

  const tmpNewEntries = newEntries ?? {};
  const tmpOldEntries = oldEntries ?? {};

  for (let order = 0; ; order++) {
    const nextSteps = findPendingByOrder(stepList, order);

    if (!nextSteps.length) {
      break;
    }

    const resultEntries = [];

    for (let offset = 0; offset < nextSteps.length; offset += batchSize) {
      const stepsBatch = nextSteps.slice(offset, offset + batchSize);

      const stepPromises = stepsBatch.map((entry) => {
        return applyPendingStep(entry, tmpNewEntries, tmpOldEntries, tmpEntries, handlers, errorList, force);
      });

      resultEntries.push(...(await Promise.all(stepPromises)));
    }

    for (const entry of resultEntries) {
      // Don't include deleted entries.
      if (entry) {
        tmpEntries[entry.entryId] = entry;
      }
    }
  }

  return {
    result: tmpEntries,
    errors: errorList
  };
};

const findPendingByOrder = (stepList: StepState[], order: number) => {
  return stepList.filter((step) => step.order === order);
};

const applyPendingStep = async <E extends EntryState<T>, T extends string>(
  step: StepState,
  newEntries: EntryStates<E>,
  oldEntries: EntryStates<E>,
  tmpEntries: EntryStates<E>,
  handlers: StepHandlers<E>,
  errorList: Error[],
  force: boolean
): Promise<E | undefined> => {
  const { action, entryId } = step;

  const entries = action !== StepAction.Delete ? newEntries : oldEntries;
  const candidate = getEntry(entries, entryId);
  const handler = getEntryHandler(handlers, candidate);

  const buildContext = (entryMap: EntryStates<E>, entry: E) => {
    return {
      force,
      getDependencies: <T extends EntryState>(type?: T['type']) => {
        return getDependencies<T>(entryMap, entry, type);
      }
    };
  };

  try {
    switch (action) {
      case StepAction.Create: {
        const context = buildContext(tmpEntries, candidate);
        const result = await handler.create(candidate, context);

        return { ...candidate, result };
      }

      case StepAction.Replace: {
        const context = buildContext(tmpEntries, candidate);
        const result = await handler.replace(candidate, getEntry(oldEntries, entryId), context);

        return !result ? candidate : { ...candidate, result };
      }

      case StepAction.Update: {
        if (!force && (!step.preview || step.preview.counts === 0)) {
          return getEntry(oldEntries, entryId);
        }

        const context = buildContext(tmpEntries, candidate);
        const result = await handler.update(candidate, getEntry(oldEntries, entryId), context);

        return !result ? candidate : { ...candidate, result };
      }

      case StepAction.Delete: {
        const context = buildContext(oldEntries, candidate);
        await handler.delete(candidate, context);

        break;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      errorList.push(error);
    }

    return oldEntries[entryId];
  }

  return undefined;
};

const getEntryHandler = <E extends EntryState<T>, T extends string>(handlers: StepHandlers<E>, entry: E) => {
  const handler = handlers[entry.type];

  if (!handler) {
    throw new HandlerNotFoundError(entry.type, entry.entryId);
  }

  return handler;
};
