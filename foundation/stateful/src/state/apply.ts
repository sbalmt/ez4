import type { EntryState, EntryStates, EntryTypes } from '../types/entry';
import type { StepHandlers, StepState } from '../types/step';

import { Tasks } from '@ez4/utils';

import { HandlerNotFoundError, EntriesNotFoundError } from './errors';
import { getEntry, getEntryDependencies, getEntryConnections, getEntryDependents } from './entry';
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

  const { handlers, batchSize = 15, force = false } = options;

  const allNewEntries = { ...newEntries };
  const allOldEntries = { ...oldEntries };

  const allEntries: EntryStates<E> = {};

  const errorList: Error[] = [];

  for (let order = 0; ; order++) {
    const nextSteps = findPendingByOrder(stepList, order);

    if (!nextSteps.length) {
      break;
    }

    const stepTasks = nextSteps.map((entry) => () => {
      return applyPendingStep(entry, allNewEntries, allOldEntries, allEntries, handlers, errorList, force);
    });

    const taskResults = await Tasks.run(stepTasks, batchSize);

    for (const entry of taskResults) {
      // Don't include deleted entries.
      if (entry) {
        allNewEntries[entry.entryId] = entry;
        allEntries[entry.entryId] = entry;
      }
    }
  }

  return {
    result: allEntries,
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
  allEntries: EntryStates<E>,
  handlers: StepHandlers<E>,
  errorList: Error[],
  force: boolean
): Promise<E | undefined> => {
  const { action, entryId } = step;

  const entries = action !== StepAction.Delete ? newEntries : oldEntries;
  const candidate = getEntry(entries, entryId);
  const handler = getEntryHandler(handlers, candidate);

  const buildContext = (processedEntryMap: EntryStates<E>, completeEntryMap: EntryStates<E>, entry: E) => {
    return {
      force,
      getDependencies: <T extends EntryState>(type?: EntryTypes<T>) => {
        return getEntryDependencies<T>(processedEntryMap, entry, type);
      },
      getConnections: <T extends EntryState>(type?: EntryTypes<T>) => {
        return getEntryConnections<T>(completeEntryMap, entry, type);
      },
      getDependents: <T extends EntryState>(type?: EntryTypes<T>) => {
        return getEntryDependents<T>(completeEntryMap, entry, type);
      }
    };
  };

  try {
    switch (action) {
      case StepAction.Create: {
        const context = buildContext(allEntries, newEntries, candidate);
        const result = await handler.create(candidate, context);

        return { ...candidate, result };
      }

      case StepAction.Replace: {
        const context = buildContext(allEntries, newEntries, candidate);
        const result = await handler.replace(candidate, getEntry(oldEntries, entryId), context);

        return !result ? candidate : { ...candidate, result };
      }

      case StepAction.Update: {
        if (!force && (!step.preview || step.preview.counts === 0)) {
          return getEntry(oldEntries, entryId);
        }

        const context = buildContext(allEntries, newEntries, candidate);
        const result = await handler.update(candidate, getEntry(oldEntries, entryId), context);

        return !result ? candidate : { ...candidate, result };
      }

      case StepAction.Delete: {
        const context = buildContext(oldEntries, oldEntries, candidate);

        await handler.delete(candidate, context);
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
