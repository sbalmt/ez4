import type { EntryState, EntryStates } from '../types/entry';
import type { StepState, StepHandlers, StepOptions } from '../types/step';
import type { HydratedEntryState } from '../types/hydrate';

import { CorruptedStateReferences, HandlerNotFoundError, EntriesNotFoundError } from './errors';
import { hydrateState } from './hydrate';
import { StepAction } from './step';

export type PlanOptions<E extends EntryState> = {
  handlers: StepHandlers<E>;
  force?: boolean;
};

export const planSteps = async <E extends EntryState>(
  newEntries: EntryStates<E> | undefined,
  oldEntries: EntryStates<E> | undefined,
  options: PlanOptions<E>
) => {
  const creationSteps: StepState[] = [];
  const deletionSteps: StepState[] = [];

  const newEntrySet = new Set<string>();

  let actionOrder = 0;

  if (!newEntries && !oldEntries) {
    throw new EntriesNotFoundError();
  }

  if (newEntries) {
    const newEntryList = Object.values(newEntries).filter((entry) => !!entry);
    const handlers = options.handlers;

    const stepOptions: StepOptions = {
      force: !!options.force
    };

    while (true) {
      const entries = findPendingChanges(newEntryList, newEntrySet);

      if (!entries.length) {
        break;
      }

      const nextSteps = await planPendingChanges(entries, newEntrySet, oldEntries, handlers, actionOrder++, stepOptions);

      creationSteps.push(...nextSteps);
    }

    if (newEntryList.length !== newEntrySet.size) {
      throw new CorruptedStateReferences(newEntryList.length, newEntrySet.size);
    }
  }

  if (oldEntries) {
    const combinedEntryMap = newEntries ? combineEntryMaps(newEntries, oldEntries) : oldEntries;
    const hydratedEntryMap = hydrateState(combinedEntryMap);

    const oldEntryList = Object.values(hydratedEntryMap).filter(({ entryId }) => {
      return !newEntrySet.has(entryId);
    });

    const oldEntrySet = new Set<string>();

    while (true) {
      const entries = findPendingRemoval(oldEntryList, oldEntrySet);

      if (!entries.length) {
        break;
      }

      const nextSteps = planPendingRemoval(entries, oldEntrySet, actionOrder++);

      deletionSteps.push(...nextSteps);
    }

    if (oldEntryList.length !== oldEntrySet.size) {
      throw new CorruptedStateReferences(oldEntryList.length, oldEntrySet.size);
    }
  }

  return [...creationSteps, ...deletionSteps];
};

const findPendingChanges = <E extends EntryState>(entryList: E[], visitSet: Set<string>) => {
  return entryList.filter(({ entryId, dependencies }) => {
    return !visitSet.has(entryId) && dependencies.every((identifier) => visitSet.has(identifier));
  });
};

const findPendingRemoval = <E extends EntryState>(entryList: HydratedEntryState<E>[], visitSet: Set<string>) => {
  return entryList.filter(({ entryId, dependents }) => {
    return !visitSet.has(entryId) && dependents.every((identifier) => visitSet.has(identifier));
  });
};

const planPendingChanges = async <E extends EntryState<T>, T extends string>(
  entryList: E[],
  visitSet: Set<string>,
  oldEntries: EntryStates<E> | undefined,
  handlers: StepHandlers<E>,
  order: number,
  options: StepOptions
) => {
  const stateList: StepState[] = [];

  for (const candidate of entryList) {
    const { type, entryId } = candidate;

    const current = oldEntries && oldEntries[entryId];
    const handler = handlers[type];

    if (!handler) {
      throw new HandlerNotFoundError(type, entryId);
    }

    visitSet.add(entryId);

    if (!current) {
      stateList.push({ action: StepAction.Create, entryId, order });
      continue;
    }

    if (type !== current.type) {
      stateList.push({ action: StepAction.Replace, entryId, order });
      continue;
    }

    const preview = await handler.preview(candidate, current, options);

    if (!handler.equals(candidate, current)) {
      stateList.push({ action: StepAction.Replace, entryId, order, preview });
      continue;
    }

    stateList.push({ action: StepAction.Update, entryId, order, preview });
  }

  return stateList;
};

const planPendingRemoval = <E extends EntryState>(entryList: HydratedEntryState<E>[], visitSet: Set<string>, order: number) => {
  return entryList.map<StepState>(({ entryId }) => {
    visitSet.add(entryId);

    return {
      action: StepAction.Delete,
      entryId,
      order
    };
  });
};

/**
 * Create a new entry map containing entries from both given maps.
 * When an entry exists in both `target` and `source`, the `target` entry is prioritized.
 *
 * @param targetMap Target entry map.
 * @param sourceMap Source entry map.
 * @returns Returns a new entry map combining `target` and `source` entries.
 */
const combineEntryMaps = <E extends EntryState>(targetMap: EntryStates<E>, sourceMap: EntryStates<E>) => {
  const tmpEntries: EntryStates<E> = {};
  const entryIds = new Set([...Object.keys(targetMap), ...Object.keys(sourceMap)]);

  for (const entryId of entryIds) {
    const targetEntry = targetMap[entryId];
    const sourceEntry = sourceMap[entryId];

    if (targetEntry) {
      tmpEntries[entryId] = targetEntry;
    } else if (sourceEntry) {
      tmpEntries[entryId] = sourceEntry;
    }
  }

  return tmpEntries;
};
