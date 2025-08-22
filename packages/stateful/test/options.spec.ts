import type { EntryStates, StepHandlers, StepOptions } from '@ez4/stateful';
import type { TestEntryState } from './common/entry.js';

import { planSteps } from '@ez4/stateful';

import { describe, it, mock } from 'node:test';
import { equal } from 'node:assert/strict';

import { commonStepHandler, commonStepHandlers } from './common/handler.js';
import { TestEntryType } from './common/entry.js';

const baseState: EntryStates<TestEntryState> = {
  entryA: {
    type: TestEntryType.A,
    entryId: 'entryA',
    dependencies: [],
    parameters: {}
  }
};

const checkDependencies = (options: StepOptions, expectedForceOption: boolean) => {
  equal(options.force, expectedForceOption);
};

describe('options tests', () => {
  it('assert :: preview options', async () => {
    const previewHandler = mock.fn((_ca: TestEntryState, _cu: TestEntryState, options: StepOptions) => {
      checkDependencies(options, true);
    });

    const handlers: StepHandlers<TestEntryState> = {
      ...commonStepHandlers,
      [TestEntryType.A]: {
        ...commonStepHandler,
        preview: previewHandler
      }
    };

    const newState = {
      ...baseState
    };

    await planSteps(newState, baseState, {
      force: true,
      handlers
    });

    equal(previewHandler.mock.callCount(), 1);
  });
});
