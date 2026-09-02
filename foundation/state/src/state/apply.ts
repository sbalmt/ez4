import type { StepHandlers, StepPostAction, StepState } from '../types/step';
import type { EntryState, EntryStates, EntryTypes } from '../types/entry';
import type { Warning } from '../types/warning';

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
  warnings: Warning[];
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

  const warningList: Warning[] = [];
  const errorList: Error[] = [];

  let stepsCounter = stepList.length;
  let stepsFinished = 0;

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
      onProgress: () => onProgress?.(++stepsFinished, stepsCounter),
      concurrency
    });

    if (postActions.length) {
      allPostActions.push(postActions);
      stepsCounter += postActions.length;
    }

    for (const [entry, issues] of stepResults) {
      if (entry) {
        allNewEntries[entry.entryId] = entry;

        if (!issues) {
          succeededEntries[entry.entryId] = entry;
        } else {
          failedEntries[entry.entryId] = entry;
        }
      }

      if (issues) {
        if (issues instanceof Array) {
          warningList.push(...issues);
        } else {
          errorList.push(issues);
        }
      }
    }
  }

  for (let index = 0; index < allPostActions.length; index++) {
    const stepActions = allPostActions[index];

    const actionTasks = stepActions.splice(0).map((postAction) => async () => {
      return applyPostAction(postAction, succeededEntries, failedEntries, errorList);
    });

    await Tasks.run(actionTasks, {
      onProgress: () => onProgress?.(++stepsFinished, stepsCounter),
      concurrency
    });

    if (stepActions.length) {
      allPostActions.push(stepActions);
      stepsCounter += stepActions.length;
    }
  }

  return {
    errors: errorList,
    warnings: warningList,
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
): Promise<[E | undefined] | [E | undefined, Error] | [E | undefined, Warning[]]> => {
  const { action, entryId } = step;

  const warnings: Warning[] = [];

  const candidate = getEntry(action !== StepAction.Delete ? newEntries : oldEntries, entryId);
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
      },
      addWarning: (message: string) => {
        warnings.push({ message });
      }
    };
  };

  try {
    switch (action) {
      case StepAction.Create: {
        const entry = { ...candidate };

        if (!checkAllSucceeded(entry.dependencies, succeededEntries)) {
          throw new SkipFailedEntryDependencyError(entryId);
        }

        const context = buildContext(succeededEntries, newEntries, entry);

        entry.result = await handler.create(entry, context);

        if (warnings.length) {
          return [entry, warnings];
        }

        return [entry];
      }

      case StepAction.Update: {
        if (!force && (!step.preview || step.preview.counts <= 0)) {
          return [getEntry(oldEntries, entryId)];
        }

        const entry = { ...candidate };

        if (!checkAllSucceeded(entry.dependencies, succeededEntries)) {
          throw new SkipFailedEntryDependencyError(entryId);
        }

        const context = buildContext(succeededEntries, newEntries, entry);
        const result = await handler.update(entry, getEntry(oldEntries, entryId), context);

        if (result) {
          entry.result = result;
        }

        if (warnings.length) {
          return [entry, warnings];
        }

        return [entry];
      }

      case StepAction.Replace: {
        const entry = { ...candidate };

        if (!checkAllSucceeded(entry.dependencies, succeededEntries)) {
          throw new SkipFailedEntryDependencyError(entryId);
        }

        const context = buildContext(succeededEntries, newEntries, entry);
        const result = await handler.replace(entry, getEntry(oldEntries, entryId), context);

        if (result) {
          entry.result = result;
        }

        if (warnings.length) {
          return [entry, warnings];
        }

        return [entry];
      }

      case StepAction.Delete: {
        const entry = { ...candidate };

        const context = buildContext(oldEntries, oldEntries, entry);

        await handler.delete(entry, context);

        if (warnings.length > 0) {
          entry.dependencies = entry.dependencies.filter((dependencyId) => newEntries[dependencyId]);
          entry.connections = undefined;

          return [entry, warnings];
        }
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

  try {
    if (failedEntries[entryId] || (!succeededEntries[entryId] && action !== StepAction.Delete)) {
      throw new SkipFailedEntryError(entryId);
    }

    if (succeededEntries[entryId] && !checkAllSucceeded(dependencies, succeededEntries)) {
      throw new SkipFailedEntryDependencyError(entryId);
    }

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
