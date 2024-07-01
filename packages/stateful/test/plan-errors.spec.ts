import type { EntryStates } from '@ez4/stateful';
import type { TestEntryState } from './common/entry.js';

import {
  EntriesNotFoundError,
  HandlerNotFoundError,
  CorruptedStateReferences,
  planSteps
} from '@ez4/stateful';

import { describe, it } from 'node:test';
import { throws } from 'node:assert/strict';

import { commonStepHandlers } from './common/handler.js';
import { TestEntryType } from './common/entry.js';

describe.only('plan errors tests', () => {
  it('throws :: entries not found', () => {
    throws(() => planSteps(undefined, undefined, commonStepHandlers), EntriesNotFoundError);
  });

  it('throws :: handler not found', () => {
    const state: EntryStates<TestEntryState> = {
      entryA: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: [],
        parameters: {}
      }
    };

    // Can't find handler for TestEntryType.A.
    throws(() => planSteps(state, undefined, {}), HandlerNotFoundError);
  });

  it('throws :: corrupted state references', () => {
    const state: EntryStates<TestEntryState> = {
      entryA: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: ['entryC'],
        parameters: {}
      }
    };

    // Can't find entryC reference.
    throws(() => planSteps(state, undefined, commonStepHandlers), CorruptedStateReferences);
  });
});
