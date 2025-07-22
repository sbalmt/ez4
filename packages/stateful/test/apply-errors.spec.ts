import type { EntryStates } from '@ez4/stateful';
import type { TestEntryState } from './common/entry.js';

import { HandlerNotFoundError, EntriesNotFoundError, applySteps, planSteps } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { rejects } from 'node:assert/strict';

import { commonStepHandlers } from './common/handler.js';
import { TestEntryType } from './common/entry.js';

describe('apply errors tests', () => {
  it('throws :: entries not found', async () => {
    await rejects(() => applySteps([], undefined, undefined, { handlers: commonStepHandlers }), EntriesNotFoundError);
  });

  it('throws :: handler not found', async () => {
    const state: EntryStates<TestEntryState> = {
      entryA: {
        type: TestEntryType.A,
        entryId: 'entryA',
        dependencies: [],
        parameters: {}
      }
    };

    const steps = await planSteps(state, undefined, {
      handlers: commonStepHandlers
    });

    // Can't find handler for TestEntryType.A.
    await rejects(() => applySteps(steps, state, undefined, { handlers: {} }), HandlerNotFoundError);
  });
});
