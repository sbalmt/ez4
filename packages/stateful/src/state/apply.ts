import type { EntryState, EntryStates } from '../types/entry.js';
import type { StepHandlers, StepState } from '../types/step.js';

import { HandlerNotFoundError, EntriesNotFoundError } from './errors.js';
import { getDependencies, getEntry } from './entry.js';
import { StepAction } from './step.js';

export type ApplyState<E extends EntryState = EntryState> = {
  result: EntryStates<E>;
  errors: Error[];
};

export const applySteps = async <E extends EntryState>(
  stepList: StepState[],
  newEntries: EntryStates<E> | undefined,
  oldEntries: EntryStates<E> | undefined,
  handlers: StepHandlers<E>
): Promise<ApplyState<E>> => {
  if (!newEntries && !oldEntries) {
    throw new EntriesNotFoundError();
  }

  const tmpEntries: EntryStates<E> = {};
  const errorList: Error[] = [];

  const tmpNewEntries = newEntries ?? {};
  const tmpOldEntries = oldEntries ?? {};

  for (let order = 0; ; order++) {
    const nextSteps = findPendingByOrder(stepList, order);

    if (!nextSteps.length) {
      break;
    }

    const stepPromises = nextSteps.map(async (entry) => {
      return applyPendingStep(entry, errorList, tmpNewEntries, tmpOldEntries, tmpEntries, handlers);
    });

    const resultEntries = await Promise.all(stepPromises);

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
  errorList: Error[],
  newEntries: EntryStates<E>,
  oldEntries: EntryStates<E>,
  tmpEntries: EntryStates<E>,
  handlers: StepHandlers<E>
): Promise<E | undefined> => {
  const { action, entryId } = step;

  const entries = action !== StepAction.Delete ? newEntries : oldEntries;
  const candidate = getEntry(entries, entryId);
  const handler = getEntryHandler(handlers, candidate);

  const buildContext = (entryMap: EntryStates<E>, entry: E) => {
    return {
      getDependencies: <T extends string>(type?: T) => {
        return getDependencies<E, T>(entryMap, entry, type);
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

const getEntryHandler = <E extends EntryState<T>, T extends string>(
  handlers: StepHandlers<E>,
  entry: E
) => {
  const handler = handlers[entry.type];

  if (!handler) {
    throw new HandlerNotFoundError(entry.type, entry.entryId);
  }

  return handler;
};
