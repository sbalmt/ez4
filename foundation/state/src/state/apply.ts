import type { StepHandlers, StepPostAction, StepState } from '../types/step';
import type { EntryState, EntryStates, EntryTypes } from '../types/entry';

import { Tasks } from '@ez4/utils';

import { getEntry, getEntryDependencies, getEntryConnections, getEntryDependents } from './entry';
import { HandlerNotFoundError, EntriesNotFoundError, SkipFailedEntryError, SkipFailedEntryDependencyError } from './errors';
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

type PostActionEntry<E extends EntryState> = {
  callback: StepPostAction;
  action: StepAction;
  entry: E;
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

  const allPostActions: PostActionEntry<E>[][] = [];

  const succeededEntries: EntryStates<E> = {};
  const failedEntries: EntryStates<E> = {};

  const errorList: Error[] = [];

  let totalSteps = stepList.length;
  let progressCounter = 0;

  for (let order = 0; ; order++) {
    const nextSteps = findPendingByOrder(stepList, order);

    if (!nextSteps.length) {
      break;
    }

    const postActions: PostActionEntry<E>[] = [];

    const stepTasks = nextSteps.map((entry) => () => {
      return applyPendingStep(entry, allNewEntries, allOldEntries, succeededEntries, postActions, handlers, force);
    });

    const stepResults = await Tasks.run(stepTasks, {
      onProgress: () => onProgress?.(++progressCounter, totalSteps),
      concurrency
    });

    if (postActions.length) {
      allPostActions.push(postActions);
    }

    for (const [entry, error] of stepResults) {
      if (entry) {
        allNewEntries[entry.entryId] = entry;

        if (!error) {
          succeededEntries[entry.entryId] = entry;
        } else {
          failedEntries[entry.entryId] = entry;
        }
      }

      if (error) {
        errorList.push(error);
      }
    }
  }

  for (let index = 0; index < allPostActions.length; index++) {
    const stepActions = allPostActions[index];

    totalSteps += stepActions.length;

    const actionTasks = stepActions.splice(0).map((postAction) => async () => {
      return applyPostAction(postAction, succeededEntries, failedEntries, errorList);
    });

    await Tasks.run(actionTasks, {
      onProgress: () => onProgress?.(++progressCounter, totalSteps),
      concurrency
    });

    if (stepActions.length) {
      allPostActions.push(stepActions);
    }
  }

  return {
    errors: errorList,
    result: {
      ...succeededEntries,
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
  succeededEntries: EntryStates<E>,
  postActions: PostActionEntry<E>[],
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
      },
      postAction: (callback: StepPostAction) => {
        postActions.push({ callback, action, entry });
      }
    };
  };

  try {
    switch (action) {
      case StepAction.Create: {
        const entry = { ...candidate };
        const context = buildContext(succeededEntries, newEntries, entry);

        entry.result = await handler.create(entry, context);

        return [entry];
      }

      case StepAction.Replace: {
        const entry = { ...candidate };

        const context = buildContext(succeededEntries, newEntries, entry);
        const result = await handler.replace(entry, getEntry(oldEntries, entryId), context);

        if (result) {
          entry.result = result;
        }

        return [entry];
      }

      case StepAction.Update: {
        if (!force && (!step.preview || step.preview.counts === 0)) {
          return [getEntry(oldEntries, entryId)];
        }

        const entry = { ...candidate };
        const context = buildContext(succeededEntries, newEntries, entry);
        const result = await handler.update(entry, getEntry(oldEntries, entryId), context);

        if (result) {
          entry.result = result;
        }

        return [entry];
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

const applyPostAction = async <E extends EntryState<T>, T extends string>(
  postAction: PostActionEntry<E>,
  succeededEntries: EntryStates<E>,
  failedEntries: EntryStates<E>,
  errorList: Error[]
) => {
  const { callback, action, entry } = postAction;
  const { entryId, dependencies } = entry;

  if (failedEntries[entryId] || (!succeededEntries[entryId] && action !== StepAction.Delete)) {
    errorList.push(new SkipFailedEntryError(entryId));
    return;
  }

  if (succeededEntries[entryId] && !checkAllSucceeded(dependencies, succeededEntries)) {
    errorList.push(new SkipFailedEntryDependencyError(entryId));
    return;
  }

  try {
    await callback();
  } catch (error) {
    errorList.push(error instanceof Error ? error : new Error(`${error}`));

    delete succeededEntries[entryId];

    failedEntries[entryId] = entry;
    entry.partial = true;
  }
};

const checkAllSucceeded = <E extends EntryState<T>, T extends string>(dependencies: string[], succeededEntries: EntryStates<E>) => {
  return dependencies.every((dependencyId): boolean => {
    const entry = succeededEntries[dependencyId];

    if (entry) {
      return checkAllSucceeded(entry.dependencies, succeededEntries);
    }

    return false;
  });
};

const getEntryHandler = <E extends EntryState<T>, T extends string>(handlers: StepHandlers<E>, entry: E) => {
  const handler = handlers[entry.type];

  if (!handler) {
    throw new HandlerNotFoundError(entry.type, entry.entryId);
  }

  return handler;
};
