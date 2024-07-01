import type { EntryStates } from '@ez4/stateful';
import type { TestEntryState } from './common/entry.js';

import {
  CorruptedEntryMapError,
  DependencyNotFoundError,
  DuplicateEntryError,
  EntryNotFoundError,
  attachEntry,
  getDependencies,
  linkDependency,
  validateEntries
} from '@ez4/stateful';

import { describe, it } from 'node:test';
import { throws } from 'node:assert/strict';

import { TestEntryType } from './common/entry.js';
import { ok } from 'node:assert';

describe.only('entry errors tests', () => {
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
    throws(() => linkDependency(state, 'entryB', 'entryA'), EntryNotFoundError);
    throws(() => linkDependency(state, 'entryA', 'entryB'), DependencyNotFoundError);

    // entryC is already a dependency of entryA.
    throws(() => linkDependency(state, 'entryA', 'entryC'), DuplicateEntryError);
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
      getDependencies(state, state.entryA, TestEntryType.B);
    }, DependencyNotFoundError);
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
