import type { EntryState, EntryStates, TypedEntryState } from '../types/entry.js';

import {
  DuplicateEntryError,
  DependencyNotFoundError,
  EntryNotFoundError,
  CorruptedEntryMapError
} from './errors.js';

export const getEntry = <E extends EntryState>(entryMap: EntryStates<E>, entryId: string) => {
  const entry = entryMap[entryId];

  if (!entry) {
    throw new EntryNotFoundError(entryId);
  }

  return entry;
};

export const attachEntry = <E1 extends EntryState, E2 extends E1>(
  entryMap: EntryStates<E1>,
  entry: E2
) => {
  if (entryMap[entry.entryId]) {
    throw new DuplicateEntryError(entry.entryId);
  }

  entryMap[entry.entryId] = entry;

  return entry;
};

export const validateEntries = <E extends EntryState>(entryMap: EntryStates<E>) => {
  for (const entryId in entryMap) {
    const entry = entryMap[entryId];

    if (!entry) {
      throw new EntryNotFoundError(entryId);
    }

    if (entryId !== entry.entryId) {
      throw new CorruptedEntryMapError(entry.entryId, entryId);
    }

    for (const dependencyId of entry.dependencies) {
      if (!entryMap[dependencyId]) {
        throw new DependencyNotFoundError(entryId, dependencyId);
      }
    }
  }
};

export const linkDependency = <E extends EntryState>(
  entryMap: EntryStates<E>,
  entryId: string,
  dependencyId: string
) => {
  if (!entryMap[entryId]) {
    throw new EntryNotFoundError(entryId);
  }

  if (!entryMap[dependencyId]) {
    throw new DependencyNotFoundError(entryId, dependencyId);
  }

  if (entryMap[entryId].dependencies.includes(dependencyId)) {
    throw new DuplicateEntryError(dependencyId);
  }

  entryMap[entryId].dependencies.push(dependencyId);
};

export const getDependencies = <E extends EntryState, T extends string>(
  entryMap: EntryStates<E>,
  entry: E,
  type?: T
): TypedEntryState<E, T>[] => {
  const dependencyList: TypedEntryState<E, T>[] = [];

  const isType = (entry: EntryState): entry is TypedEntryState<E, T> => {
    return !type || entry.type === type;
  };

  for (const dependencyId of entry.dependencies) {
    const dependency = entryMap[dependencyId];

    if (!dependency) {
      throw new DependencyNotFoundError(entry.entryId, dependencyId);
    }

    if (isType(dependency)) {
      dependencyList.push(dependency);
    }
  }

  return dependencyList;
};
