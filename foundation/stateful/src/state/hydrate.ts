import type { EntryState, EntryStates } from '../types/entry.js';
import type { HydratedEntryState } from '../types/hydrate.js';

import { DependencyNotFoundError, EntryNotFoundError } from './errors.js';

/**
 * Validate and fill in all the `dependents` for each entry in the given state.
 *
 * @param entryMap Entry state map.
 * @returns Returns a new entries map containing all entries with its dependents.
 * @throws When a referenced entry doesn't exists.
 */
export const hydrateState = <E extends EntryState>(entryMap: EntryStates<E>) => {
  const tmpEntries: Record<string, HydratedEntryState<E>> = {};

  for (const entryId in entryMap) {
    const entry = entryMap[entryId];

    if (!entry) {
      throw new EntryNotFoundError(entryId);
    }

    if (!tmpEntries[entryId]) {
      tmpEntries[entryId] = { ...entry, dependents: [] };
    }

    for (const dependencyId of entry.dependencies) {
      const dependency = tmpEntries[dependencyId];

      if (dependency) {
        dependency.dependents.push(entryId);
        continue;
      }

      if (!entryMap[dependencyId]) {
        throw new DependencyNotFoundError(entryId, dependencyId);
      }

      tmpEntries[dependencyId] = {
        ...entryMap[dependencyId],
        dependents: [entryId]
      };
    }
  }

  return tmpEntries;
};
