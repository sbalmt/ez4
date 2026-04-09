import type { EntryStates, StepContext, StepHandlers } from '@ez4/stateful';
import type { TestEntryState } from './common/entry';

import { planSteps, applySteps, DependencyNotFoundError } from '@ez4/stateful';
import { ok, equal, deepEqual, notEqual } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { commonStepHandler } from './common/handler';
import { TestEntryType } from './common/entry';

const baseState: EntryStates<TestEntryState> = {
  entryA: {
    type: TestEntryType.A,
    entryId: 'entryA',
    dependencies: [],
    parameters: {}
  }
};

describe('apply tests', () => {
  class TestError extends Error {
    constructor() {
      super('Apply error!');
    }
  }

  it('assert :: create action', async () => {
    const createHandler = mock.fn(commonStepHandler.create);

    const handlers: StepHandlers<TestEntryState> = {
      [TestEntryType.A]: {
        ...commonStepHandler,
        create: createHandler
      }
    };

    const steps = await planSteps(baseState, undefined, { handlers });

    const { result } = await applySteps(steps, baseState, undefined, { handlers });

    equal(createHandler.mock.callCount(), 1);
    deepEqual(result.entryA?.result, { type: 'created' });
  });

  it('assert :: replace action', async () => {
    ok(baseState.entryA);

    const replaceHandler = mock.fn(commonStepHandler.replace);

    const handlers: StepHandlers<TestEntryState> = {
      [TestEntryType.B]: {
        ...commonStepHandler,
        replace: replaceHandler
      }
    };

    const newState = {
      entryA: {
        ...baseState.entryA,
        type: TestEntryType.B
      }
    };

    const steps = await planSteps(newState, baseState, { handlers });

    const { result } = await applySteps(steps, newState, baseState, { handlers });

    equal(replaceHandler.mock.callCount(), 1);
    deepEqual(result.entryA?.result, { type: 'replaced' });
  });

  it('assert :: update action', async () => {
    const updateHandler = mock.fn(commonStepHandler.update);

    const handlers: StepHandlers<TestEntryState> = {
      [TestEntryType.A]: {
        ...commonStepHandler,
        update: updateHandler
      }
    };

    const newState = {
      ...baseState
    };

    const steps = await planSteps(newState, baseState, { handlers });

    const { result } = await applySteps(steps, newState, baseState, { handlers });

    equal(updateHandler.mock.callCount(), 1);
    deepEqual(result.entryA?.result, { type: 'updated' });
  });

  it('assert :: update (no preview)', async () => {
    const previewHandler = mock.fn(() => undefined);

    const handlers: StepHandlers<TestEntryState> = {
      [TestEntryType.A]: {
        ...commonStepHandler,
        preview: previewHandler
      }
    };

    const newState = {
      ...baseState
    };

    const steps = await planSteps(newState, baseState, { handlers });

    const { result } = await applySteps(steps, newState, baseState, { handlers });

    equal(previewHandler.mock.callCount(), 1);
    equal(result.entryA?.result, undefined);
  });

  it('assert :: update (rollback)', async () => {
    const updateHandler = mock.fn(() => {
      throw new TestError();
    });

    const handlers: StepHandlers<TestEntryState> = {
      [TestEntryType.A]: {
        ...commonStepHandler,
        update: updateHandler
      }
    };

    const newState = {
      ...baseState
    };

    const steps = await planSteps(newState, baseState, { handlers });

    const { result, errors } = await applySteps(steps, newState, baseState, { handlers });

    equal(updateHandler.mock.callCount(), 1);
    notEqual(result.entryA?.result, { type: 'updated' });

    equal(errors.length, 1);
    ok(errors[0] instanceof TestError);
  });

  it('assert :: update (rollback with dependency)', async () => {
    const createHandler = mock.fn((_candidate: TestEntryState, context: StepContext) => {
      context.getDependencies('entryA');
    });

    const updateHandler = mock.fn(() => {
      throw new TestError();
    });

    const handlers: StepHandlers<TestEntryState> = {
      [TestEntryType.B]: {
        ...commonStepHandler,
        create: createHandler
      },
      [TestEntryType.A]: {
        ...commonStepHandler,
        update: updateHandler
      }
    };

    const newState = {
      ...baseState,
      entryB: {
        type: TestEntryType.B,
        entryId: 'entryB',
        dependencies: ['entryA'],
        parameters: {}
      }
    };

    const steps = await planSteps(newState, baseState, { handlers });

    const { result, errors } = await applySteps(steps, newState, baseState, { handlers });

    equal(updateHandler.mock.callCount(), 1);
    notEqual(result.entryA?.result, { type: 'updated' });

    equal(createHandler.mock.callCount(), 1);
    notEqual(result.entryB?.result, { type: 'created' });

    equal(errors.length, 2);

    ok(errors[0] instanceof TestError);
    ok(errors[1] instanceof DependencyNotFoundError);
  });

  it('assert :: delete action', async () => {
    const deleteHandler = mock.fn(commonStepHandler.delete);

    const handlers: StepHandlers<TestEntryState> = {
      [TestEntryType.A]: {
        ...commonStepHandler,
        delete: deleteHandler
      }
    };

    const steps = await planSteps(undefined, baseState, { handlers });

    const { result } = await applySteps(steps, undefined, baseState, { handlers });

    equal(deleteHandler.mock.callCount(), 1);
    equal(result.entryA, undefined);
  });

  it('assert :: delete (rollback)', async () => {
    const deleteHandler = mock.fn(() => {
      throw new TestError();
    });

    const handlers: StepHandlers<TestEntryState> = {
      [TestEntryType.A]: {
        ...commonStepHandler,
        delete: deleteHandler
      }
    };

    const steps = await planSteps(undefined, baseState, { handlers });

    const { result, errors } = await applySteps(steps, undefined, baseState, { handlers });

    equal(deleteHandler.mock.callCount(), 1);
    ok(result.entryA);

    equal(errors.length, 1);
    ok(errors[0] instanceof TestError);
  });
});
