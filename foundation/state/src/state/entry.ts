import type { EntryState, EntryStates, EntryTypes } from '../types/entry';

import {
  EntryNotFoundError,
  DependencyNotFoundError,
  ConnectionNotFoundError,
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

export const tryLinkEntryDependency = <E extends EntryState>(entryMap: EntryStates<E>, targetEntryId: string, sourceEntryId: string) => {
  try {
    linkEntryDependency(entryMap, targetEntryId, sourceEntryId);
  } catch (error) {
    if (!(error instanceof DuplicateEntryError)) {
      throw error;
    }
  }
};

export const linkEntryDependency = <E extends EntryState>(entryMap: EntryStates<E>, targetEntryId: string, sourceEntryId: string) => {
  const targetEntry = entryMap[targetEntryId];
  const sourceEntry = entryMap[sourceEntryId];

  if (!targetEntry) {
    throw new EntryNotFoundError(targetEntryId);
  }

  if (!sourceEntry) {
    throw new EntryNotFoundError(sourceEntryId);
  }

  if (sourceEntry.dependencies.includes(targetEntryId)) {
    throw new CircularDependencyError(targetEntryId, sourceEntryId);
  }

  const dependencies = targetEntry.dependencies;

  if (dependencies.includes(sourceEntryId)) {
    throw new DuplicateEntryError(sourceEntryId);
  }

  dependencies.push(sourceEntryId);

  dependencies.sort((a, b) => a.localeCompare(b));
};

export const linkEntryConnection = <E extends EntryState>(entryMap: EntryStates<E>, targetEntryId: string, sourceEntryId: string) => {
  const targetEntry = entryMap[targetEntryId];
  const sourceEntry = entryMap[sourceEntryId];

  if (!targetEntry) {
    throw new EntryNotFoundError(targetEntryId);
  }

  if (!sourceEntry) {
    throw new EntryNotFoundError(sourceEntryId);
  }

  if (!targetEntry.connections) {
    targetEntry.connections = [];
  }

  const connections = targetEntry.connections;

  if (!connections.includes(sourceEntryId)) {
    connections.push(sourceEntryId);

    connections.sort((a, b) => a.localeCompare(b));
  }
};

export const getEntryDependencies = <E extends EntryState>(entryMap: EntryStates, entry: EntryState, type?: EntryTypes<E>): E[] => {
  const dependencyList: E[] = [];

  entry.dependencies.forEach((dependencyId) => {
    const dependency = entryMap[dependencyId];

    if (!dependency) {
      throw new DependencyNotFoundError(entry.entryId, dependencyId);
    }

    if (isEntryType(dependency, type)) {
      dependencyList.push(dependency);
    }
  });

  return dependencyList;
};

export const getEntryConnections = <E extends EntryState>(entryMap: EntryStates, entry: EntryState, type?: EntryTypes<E>): E[] => {
  const connectionCache = new WeakSet<E>();
  const connectionList: E[] = [];

  const buildConnections = (entryId: string, connections: string[]) => {
    connections.forEach((connectionId) => {
      const connectionEntry = entryMap[connectionId];

      if (!connectionEntry) {
        throw new ConnectionNotFoundError(entryId, connectionId);
      }

      if (isEntryType(connectionEntry, type) && !connectionCache.has(connectionEntry)) {
        connectionCache.add(connectionEntry);
        connectionList.push(connectionEntry);

        if (connectionEntry.connections) {
          buildConnections(connectionEntry.entryId, connectionEntry.connections);
        }
      }
    });
  };

  if (entry.connections) {
    buildConnections(entry.entryId, entry.connections);
  }

  return [...connectionList];
};

export const getEntryDependents = <E extends EntryState>(entryMap: EntryStates, entry: EntryState, type?: EntryTypes<E>): E[] => {
  const dependentList: E[] = [];

  for (const dependentId in entryMap) {
    const dependent = entryMap[dependentId];

    if (!dependent) {
      throw new EntryNotFoundError(dependentId);
    }

    if (isEntryType(dependent, type) && dependent.dependencies.includes(entry.entryId)) {
      dependentList.push(dependent);
    }
  }

  return dependentList;
};

const isEntryType = <E extends EntryState>(entry: EntryState, type?: EntryTypes<E>): entry is E => {
  return !type || entry.type === type;
};
