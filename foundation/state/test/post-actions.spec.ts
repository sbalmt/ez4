import type { EntryStates, StepContext, StepHandlers } from '@ez4/state';
import type { TestEntryState } from './common/entry';

import { planSteps, applySteps, SkipFailedEntryError, SkipFailedEntryDependencyError } from '@ez4/state';
import { describe, it, mock } from 'node:test';
import { equal, ok } from 'node:assert/strict';

import { commonStepHandler, commonStepHandlers } from './common/handler';
import { TestEntryType } from './common/entry';
import { TestError } from './common/errors';

const baseState: EntryStates<TestEntryState> = {
  entryA: {
    type: TestEntryType.A,
    entryId: 'entryA',
    connections: [],
    dependencies: ['entryB'],
    parameters: {}
  },
  entryB: {
    type: TestEntryType.B,
    entryId: 'entryB',
    dependencies: ['entryC'],
    parameters: {}
  },
  entryC: {
    type: TestEntryType.C,
    entryId: 'entryC',
    connections: [],
    dependencies: [],
    parameters: {}
  }
};

describe('post actions tests', () => {
  it('assert :: single post action', async () => {
    const postActionHandler = mock.fn(() => {});

    const createHandler = mock.fn((_ca: TestEntryState, context: StepContext) => {
      context.postAction(postActionHandler);
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
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 1);
    equal(errors.length, 0);
  });

  it('assert :: nested post action', async () => {
    const postActionHandler = mock.fn(() => {});

    const createHandler = mock.fn((_ca: TestEntryState, context: StepContext) => {
      context.postAction(() => context.postAction(() => context.postAction(postActionHandler)));
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
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 1);
    equal(errors.length, 0);
  });

  it('assert :: prevent post action (entry error)', async () => {
    const postActionHandler = mock.fn(() => {});

    const createHandler = mock.fn((_candidate: TestEntryState, context: StepContext) => {
      context.postAction(postActionHandler);

      throw new TestError();
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
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);
    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof TestError);
    ok(error2 instanceof SkipFailedEntryError);
  });

  it('assert :: prevent post action (dependency error)', async () => {
    const postActionHandler = mock.fn(() => {});

    const createHandlerA = mock.fn((_candidate: TestEntryState, context: StepContext) => {
      context.postAction(postActionHandler);
    });

    const createHandlerC = mock.fn(() => {
      throw new TestError();
    });

    const handlers: StepHandlers<TestEntryState> = {
      ...commonStepHandlers,
      [TestEntryType.A]: {
        ...commonStepHandler,
        create: createHandlerA
      },
      [TestEntryType.C]: {
        ...commonStepHandler,
        create: createHandlerC
      }
    };

    const steps = await planSteps(baseState, undefined, {
      handlers
    });

    const { errors } = await applySteps(steps, baseState, undefined, {
      handlers
    });

    equal(createHandlerA.mock.callCount(), 0);
    equal(createHandlerC.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);
    equal(errors.length, 3);

    const [error1, error2, error3] = errors;

    ok(error1 instanceof TestError);
    ok(error2 instanceof SkipFailedEntryDependencyError);
    ok(error3 instanceof SkipFailedEntryDependencyError);
  });

  it('assert :: prevent post action chain (post action error)', async () => {
    const postActionHandler = mock.fn(() => {});

    const createHandler = mock.fn((_candidate: TestEntryState, context: StepContext) => {
      context.postAction(() => {
        context.postAction(postActionHandler);
        throw new TestError();
      });
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
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);
    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof TestError);
    ok(error2 instanceof SkipFailedEntryError);
  });
});
