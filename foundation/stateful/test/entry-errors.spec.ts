import type { EntryStates } from '@ez4/stateful';
import type { TestEntryState } from './common/entry';

import {
  CorruptedEntryMapError,
  DependencyNotFoundError,
  ConnectionNotFoundError,
  CircularDependencyError,
  DuplicateEntryError,
  EntryNotFoundError,
  getEntryDependencies,
  getEntryConnections,
  linkEntryDependency,
  linkEntryConnection,
  validateEntries,
  attachEntry
} from '@ez4/stateful';

import { describe, it } from 'node:test';
import { throws } from 'node:assert/strict';

import { TestEntryType } from './common/entry';
import { ok } from 'node:assert';

describe('entry errors tests', () => {
  it('assert :: attach entry', () => {
    const state: EntryStates<TestEntryState> = {
      entryA: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: [],
        parameters: {}
      }
    };

    throws(() => {
      ok(state.entryA);
      attachEntry(state, state.entryA);
    }, DuplicateEntryError);
  });

  it('assert :: link dependency', () => {
    const state: EntryStates<TestEntryState> = {
      entryA: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: ['entryC'],
        parameters: {}
      },
      entryC: {
        type: TestEntryType.C,
        entryId: 'entryC',
        dependencies: [],
        parameters: {}
      }
    };

    // entryB doesn't exists in the given state.
    throws(() => linkEntryDependency(state, 'entryB', 'entryA'), EntryNotFoundError);
    throws(() => linkEntryDependency(state, 'entryA', 'entryB'), EntryNotFoundError);

    // entryC is already a dependency of entryA.
    throws(() => linkEntryDependency(state, 'entryC', 'entryA'), CircularDependencyError);
    throws(() => linkEntryDependency(state, 'entryA', 'entryC'), DuplicateEntryError);
  });

  it('assert :: get dependencies', () => {
    const state: EntryStates<TestEntryState> = {
      entryA: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: ['entryB'],
        parameters: {}
      }
    };

    // entryB doesn't exists in the given state.
    throws(() => {
      ok(state.entryA);
      getEntryDependencies(state, state.entryA, TestEntryType.B);
    }, DependencyNotFoundError);
  });

  it('assert :: link connection', () => {
    const state: EntryStates<TestEntryState> = {
      entryA: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: [],
        connections: ['entryC'],
        parameters: {}
      },
      entryC: {
        type: TestEntryType.C,
        entryId: 'entryC',
        dependencies: [],
        parameters: {}
      }
    };

    // entryB doesn't exists in the given state.
    throws(() => linkEntryConnection(state, 'entryB', 'entryA'), EntryNotFoundError);
    throws(() => linkEntryConnection(state, 'entryA', 'entryB'), EntryNotFoundError);
  });

  it('assert :: get connections', () => {
    const state: EntryStates<TestEntryState> = {
      entryA: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: [],
        connections: ['entryB'],
        parameters: {}
      }
    };

    // entryB doesn't exists in the given state.
    throws(() => {
      ok(state.entryA);
      getEntryConnections(state, state.entryA, TestEntryType.B);
    }, ConnectionNotFoundError);
  });

  it('assert :: validate entries :: corrupted dependency entry', () => {
    const state: EntryStates<TestEntryState> = {
      entryDummy: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: [],
        parameters: {}
      }
    };

    // entryDummy doesn't corresponds to entryA.
    throws(() => validateEntries(state), CorruptedEntryMapError);
  });

  it('assert :: validate entries :: dependency not found', () => {
    const state: EntryStates<TestEntryState> = {
      entryA: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: ['entryB'],
        parameters: {}
      }
    };

    // entryB doesn't exists in the given state.
    throws(() => validateEntries(state), DependencyNotFoundError);
  });
});
