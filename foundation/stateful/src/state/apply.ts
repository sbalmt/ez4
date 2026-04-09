import type { EntryState, EntryStates, EntryTypes } from '../types/entry';
import type { StepHandlers, StepState } from '../types/step';

import { Tasks } from '@ez4/utils';

import { getEntry, getEntryDependencies, getEntryConnections, getEntryDependents } from './entry';
import { HandlerNotFoundError, EntriesNotFoundError } from './errors';
import { StepAction } from './step';

export type ApplyOptions<E extends EntryState> = {
  /**
   * Specify a function to be invoked every time a step completes.
   */
  onProgress?: (applied: number, total: number) => void;

  /**
   * All the step handlers mapped by type.
   */
  handlers: StepHandlers<E>;

  /**
   * Number of changes processed at the same time.
   * Default is `5`
   */
  concurrency?: number;

  /**
   * Determines whether or not the apply is forced.
   */
  force?: boolean;
};

export type ApplyResult<E extends EntryState = EntryState> = {
  result: EntryStates<E>;
  errors: Error[];
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

  const { handlers, onProgress, concurrency = 5, force = false } = options;

  const allNewEntries = { ...newEntries };
  const allOldEntries = { ...oldEntries };

  const successfulEntries: EntryStates<E> = {};
  const failedEntries: EntryStates<E> = {};

  const errorList: Error[] = [];

  const totalSteps = stepList.length;

  let appliedSteps = 0;

  for (let order = 0; ; order++) {
    const nextSteps = findPendingByOrder(stepList, order);

    if (!nextSteps.length) {
      break;
    }

    const stepTasks = nextSteps.map((entry) => () => {
      return applyPendingStep(entry, allNewEntries, allOldEntries, successfulEntries, handlers, force);
    });

    const stepResults = await Tasks.run(stepTasks, {
      onProgress: () => onProgress?.(++appliedSteps, totalSteps),
      concurrency
    });

    for (const [entry, error] of stepResults) {
      if (entry) {
        allNewEntries[entry.entryId] = entry;

        if (!error) {
          successfulEntries[entry.entryId] = entry;
        } else {
          failedEntries[entry.entryId] = entry;
        }
      }

      if (error) {
        errorList.push(error);
      }
    }
  }

  return {
    errors: errorList,
    result: {
      ...successfulEntries,
      ...failedEntries
    }
  };
};

const findPendingByOrder = (stepList: StepState[], order: number) => {
  return stepList.filter((step) => step.order === order);
};

const applyPendingStep = async <E extends EntryState<T>, T extends string>(
  step: StepState,
  newEntries: EntryStates<E>,
  oldEntries: EntryStates<E>,
  successfulEntries: EntryStates<E>,
  handlers: StepHandlers<E>,
  force: boolean
): Promise<[E | undefined] | [E | undefined, Error]> => {
  const { action, entryId } = step;

  const entries = action !== StepAction.Delete ? newEntries : oldEntries;
  const candidate = getEntry(entries, entryId);
  const handler = getEntryHandler(handlers, candidate);

  const buildContext = (processedEntryMap: EntryStates<E>, completedEntryMap: EntryStates<E>, entry: E) => {
    return {
      force,
      getDependencies: <T extends EntryState>(type?: EntryTypes<T>) => {
        return getEntryDependencies<T>(processedEntryMap, entry, type);
      },
      getConnections: <T extends EntryState>(type?: EntryTypes<T>) => {
        return getEntryConnections<T>(completedEntryMap, entry, type);
      },
      getDependents: <T extends EntryState>(type?: EntryTypes<T>) => {
        return getEntryDependents<T>(completedEntryMap, entry, type);
      }
    };
  };

  try {
    switch (action) {
      case StepAction.Create: {
        const context = buildContext(successfulEntries, newEntries, candidate);
        const result = await handler.create(candidate, context);

        return [{ ...candidate, result }];
      }

      case StepAction.Replace: {
        const context = buildContext(successfulEntries, newEntries, candidate);
        const result = await handler.replace(candidate, getEntry(oldEntries, entryId), context);

        return [!result ? candidate : { ...candidate, result }];
      }

      case StepAction.Update: {
        if (!force && (!step.preview || step.preview.counts === 0)) {
          return [getEntry(oldEntries, entryId)];
        }

        const context = buildContext(successfulEntries, newEntries, candidate);
        const result = await handler.update(candidate, getEntry(oldEntries, entryId), context);

        return [!result ? candidate : { ...candidate, result }];
      }

      case StepAction.Delete: {
        const context = buildContext(oldEntries, oldEntries, candidate);

        await handler.delete(candidate, context);
      }
    }
  } catch (error) {
    const entryError = error instanceof Error ? error : new Error(`${error}`);
    const oldEntry = oldEntries[entryId];

    return [oldEntry, entryError];
  }

  return [undefined];
};

const getEntryHandler = <E extends EntryState<T>, T extends string>(handlers: StepHandlers<E>, entry: E) => {
  const handler = handlers[entry.type];

  if (!handler) {
    throw new HandlerNotFoundError(entry.type, entry.entryId);
  }

  return handler;
};
