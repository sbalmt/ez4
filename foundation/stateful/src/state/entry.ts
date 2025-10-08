import type { EntryState, EntryStates } from '../types/entry';

import {
  EntryNotFoundError,
  DependencyNotFoundError,
  CircularDependencyError,
  CorruptedEntryMapError,
  DuplicateEntryError
} from './errors';

export const getEntry = <E extends EntryState>(entryMap: EntryStates<E>, entryId: string): E => {
  const entry = entryMap[entryId];

  if (!entry) {
    throw new EntryNotFoundError(entryId);
  }

  return entry;
};

export const attachEntry = <E extends EntryState, T extends E>(entryMap: EntryStates<E>, entry: T) => {
  if (entryMap[entry.entryId]) {
    throw new DuplicateEntryError(entry.entryId);
  }

  entryMap[entry.entryId] = entry;

  entry.dependencies.sort((a, b) => a.localeCompare(b));

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

export const linkDependency = <E extends EntryState>(entryMap: EntryStates<E>, entryId: string, dependencyId: string) => {
  const dependencyEntry = entryMap[dependencyId];
  const targetEntry = entryMap[entryId];

  if (!targetEntry) {
    throw new EntryNotFoundError(entryId);
  }

  if (!dependencyEntry) {
    throw new EntryNotFoundError(dependencyId);
  }

  if (dependencyEntry.dependencies.includes(entryId)) {
    throw new CircularDependencyError(entryId, dependencyId);
  }

  const dependencies = targetEntry.dependencies;

  if (dependencies.includes(dependencyId)) {
    throw new DuplicateEntryError(dependencyId);
  }

  dependencies.push(dependencyId);

  dependencies.sort((a, b) => a.localeCompare(b));
};

export const tryLinkDependency = <E extends EntryState>(entryMap: EntryStates<E>, entryId: string, dependencyId: string) => {
  try {
    linkDependency(entryMap, entryId, dependencyId);
  } catch (error) {
    if (!(error instanceof DuplicateEntryError || error instanceof CircularDependencyError)) {
      throw error;
    }
  }
};

export const getDependencies = <E extends EntryState>(entryMap: EntryStates, entry: EntryState, type?: E['type']): E[] => {
  const dependencyList: E[] = [];

  const isType = (entry: EntryState): entry is E => {
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
