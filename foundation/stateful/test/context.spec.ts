import type { EntryStates, StepContext, StepHandlers } from '@ez4/stateful';
import type { TestEntryState } from './common/entry';

import { planSteps, applySteps } from '@ez4/stateful';
import { describe, it, mock } from 'node:test';
import { equal } from 'node:assert/strict';

import { commonStepHandler, commonStepHandlers } from './common/handler';
import { TestEntryType } from './common/entry';

const baseState: EntryStates<TestEntryState> = {
  entryA: {
    type: TestEntryType.A,
    entryId: 'entryA',
    connections: ['entryA', 'entryB', 'entryC'],
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
    connections: ['entryD'],
    dependencies: [],
    parameters: {}
  },
  entryD: {
    type: TestEntryType.D,
    entryId: 'entryD',
    dependencies: ['entryA'],
    parameters: {}
  }
};

const checkDependencies = (context: StepContext) => {
  // Filter
  equal(context.getDependencies(TestEntryType.B).length, 1);
  equal(context.getDependencies(TestEntryType.C).length, 1);

  // Everything
  equal(context.getDependencies().length, 2);
};

const checkConnections = (context: StepContext) => {
  // Filter
  equal(context.getConnections(TestEntryType.A).length, 1);
  equal(context.getConnections(TestEntryType.B).length, 1);
  equal(context.getConnections(TestEntryType.C).length, 1);

  // Everything
  equal(context.getConnections().length, 4);
};

const checkDependents = (context: StepContext) => {
  // Filter
  equal(context.getDependents(TestEntryType.D).length, 1);

  // Everything
  equal(context.getDependents().length, 1);
};

describe('context tests', () => {
  it('assert :: creation context', async () => {
    const createHandler = mock.fn((_ca: TestEntryState, context: StepContext) => {
      equal(context.force, true);
      checkDependencies(context);
      checkConnections(context);
      checkDependents(context);
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

    const { errors } = await applySteps(steps, baseState, undefined, {
      force: true,
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(errors.length, 0);
  });

  it('assert :: deleting context', async () => {
    const deleteHandler = mock.fn((_ca: TestEntryState, context: StepContext) => {
      equal(context.force, false);
      checkDependencies(context);
      checkConnections(context);
      checkDependents(context);
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

    const { errors } = await applySteps(steps, undefined, baseState, {
      handlers
    });

    equal(deleteHandler.mock.callCount(), 1);
    equal(errors.length, 0);
  });

  it('assert :: updating context', async () => {
    const updateHandler = mock.fn((_ca: TestEntryState, _cu: TestEntryState, context: StepContext) => {
      equal(context.force, true);
      checkDependencies(context);
      checkConnections(context);
      checkDependents(context);
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

    const { errors } = await applySteps(steps, newState, baseState, {
      force: true,
      handlers
    });

    equal(updateHandler.mock.callCount(), 1);
    equal(errors.length, 0);
  });
});
