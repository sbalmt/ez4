import type { EntryStates, StepContext, StepHandlers } from '@ez4/stateful';
import type { TestEntryState } from './common/entry.js';

import { planSteps, applySteps } from '@ez4/stateful';
import { describe, it, mock } from 'node:test';
import { equal } from 'node:assert/strict';

import { commonStepHandler, commonStepHandlers } from './common/handler.js';
import { TestEntryType } from './common/entry.js';

const baseState: EntryStates<TestEntryState> = {
  entryA: {
    type: TestEntryType.A,
    entryId: 'entryA',
    dependencies: ['entryC', 'entryB'],
    parameters: {}
  },
  entryB: {
    type: TestEntryType.B,
    entryId: 'entryB',
    dependencies: [],
    parameters: {}
  },
  entryC: {
    type: TestEntryType.C,
    entryId: 'entryC',
    dependencies: [],
    parameters: {}
  }
};

const checkDependencies = (context: StepContext, expectedForceOption: boolean) => {
  // Filter
  equal(context.getDependencies(TestEntryType.B).length, 1);
  equal(context.getDependencies(TestEntryType.C).length, 1);

  // Everything
  equal(context.getDependencies().length, 2);

  equal(context.force, expectedForceOption);
};

describe('context tests', () => {
  it('assert :: creation context', async () => {
    const createHandler = mock.fn((_ca: TestEntryState, context: StepContext) => {
      checkDependencies(context, true);
    });

    const handlers: StepHandlers<TestEntryState> = {
      ...commonStepHandlers,
      [TestEntryType.A]: {
        ...commonStepHandler,
        create: createHandler
      }
    };

    const steps = await planSteps(baseState, undefined, {
      handlers
    });

    await applySteps(steps, baseState, undefined, {
      force: true,
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
  });

  it('assert :: deleting context', async () => {
    const deleteHandler = mock.fn((_ca: TestEntryState, context: StepContext) => {
      checkDependencies(context, false);
    });

    const handlers: StepHandlers<TestEntryState> = {
      ...commonStepHandlers,
      [TestEntryType.A]: {
        ...commonStepHandler,
        delete: deleteHandler
      }
    };

    const steps = await planSteps(undefined, baseState, {
      handlers
    });

    await applySteps(steps, undefined, baseState, {
      handlers
    });

    equal(deleteHandler.mock.callCount(), 1);
  });

  it('assert :: updating context', async () => {
    const updateHandler = mock.fn((_ca: TestEntryState, _cu: TestEntryState, context: StepContext) => {
      checkDependencies(context, true);
    });

    const handlers: StepHandlers<TestEntryState> = {
      ...commonStepHandlers,
      [TestEntryType.A]: {
        ...commonStepHandler,
        update: updateHandler
      }
    };

    const newState = { ...baseState };

    const steps = await planSteps(newState, baseState, {
      handlers
    });

    await applySteps(steps, newState, baseState, {
      force: true,
      handlers
    });

    equal(updateHandler.mock.callCount(), 1);
  });
});
