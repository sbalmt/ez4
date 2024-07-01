import type { EntryState, EntryStates } from '../types/entry.js';
import type { StepState, StepHandlers } from '../types/step.js';
import type { HydratedEntryState } from '../types/hydrate.js';

import { CorruptedStateReferences, HandlerNotFoundError, EntriesNotFoundError } from './errors.js';
import { hydrateState } from './hydrate.js';
import { StepAction } from './step.js';

export const planSteps = <E extends EntryState>(
  newEntries: EntryStates<E> | undefined,
  oldEntries: EntryStates<E> | undefined,
  handlers: StepHandlers<E>
) => {
  const stepList: StepState[] = [];
  const newEntrySet = new Set<string>();

  if (!newEntries && !oldEntries) {
    throw new EntriesNotFoundError();
  }

  if (newEntries) {
    const newEntryList = Object.values(newEntries).filter((entry) => !!entry);

    for (let order = 0; ; order++) {
      const entries = findPendingToCreate(newEntryList, newEntrySet);

      if (!entries.length) {
        break;
      }

      const nextSteps = planPendingToCreate(entries, newEntrySet, oldEntries, handlers, order);

      stepList.push(...nextSteps);
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

    for (let order = 0; ; order++) {
      const entries = findPendingToDelete(oldEntryList, oldEntrySet);

      if (!entries.length) {
        break;
      }

      const nextSteps = planPendingToDelete(entries, oldEntrySet, order);

      stepList.push(...nextSteps);
    }

    if (oldEntryList.length !== oldEntrySet.size) {
      throw new CorruptedStateReferences(oldEntryList.length, oldEntrySet.size);
    }
  }

  return stepList;
};

const findPendingToCreate = <E extends EntryState>(entryList: E[], visitSet: Set<string>) => {
  return entryList.filter(({ entryId, dependencies }) => {
    return !visitSet.has(entryId) && dependencies.every((identifier) => visitSet.has(identifier));
  });
};

const findPendingToDelete = <E extends EntryState>(
  entryList: HydratedEntryState<E>[],
  visitSet: Set<string>
) => {
  return entryList.filter(({ entryId, dependents }) => {
    return !visitSet.has(entryId) && dependents.every((identifier) => visitSet.has(identifier));
  });
};

const planPendingToCreate = <E extends EntryState<T>, T extends string>(
  entryList: E[],
  visitSet: Set<string>,
  oldEntries: EntryStates<E> | undefined,
  handlers: StepHandlers<E>,
  order: number
) => {
  return entryList.map<StepState>((candidate) => {
    const { type, entryId } = candidate;

    const current = oldEntries && oldEntries[entryId];
    const handler = handlers[type];

    if (!handler) {
      throw new HandlerNotFoundError(type, entryId);
    }

    visitSet.add(entryId);

    if (!current) {
      return { action: StepAction.Create, entryId, order };
    }

    if (type !== current.type || !handler.equals(candidate, current)) {
      return { action: StepAction.Replace, entryId, order };
    }

    return { action: StepAction.Update, entryId, order };
  });
};

const planPendingToDelete = <E extends EntryState>(
  entryList: HydratedEntryState<E>[],
  visitSet: Set<string>,
  order: number
) => {
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
const combineEntryMaps = <E extends EntryState>(
  targetMap: EntryStates<E>,
  sourceMap: EntryStates<E>
) => {
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
