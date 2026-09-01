import type { EntryStates, StepContext, StepHandlers } from '@ez4/state';
import type { TestEntryState } from './common/entry';

import { planSteps, applySteps, SkipFailedEntryError, SkipFailedEntryDependencyError } from '@ez4/state';
import { deepEqual, equal, ok } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

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

    const createHandler = mock.fn((_candidate: TestEntryState, context: StepContext) => {
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

    const { errors, warnings } = await applySteps(steps, baseState, undefined, {
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 1);
    equal(warnings.length, 0);
    equal(errors.length, 0);
  });

  it('assert :: nested post action', async () => {
    const postActionHandler = mock.fn(() => {});

    const createHandler = mock.fn((_candidate: TestEntryState, context: StepContext) => {
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

    const { errors, warnings } = await applySteps(steps, baseState, undefined, {
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 1);
    equal(warnings.length, 0);
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

    const { errors, warnings } = await applySteps(steps, baseState, undefined, {
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);
    equal(warnings.length, 0);
    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof TestError);
    ok(error2 instanceof SkipFailedEntryError);
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

    const { errors, warnings } = await applySteps(steps, baseState, undefined, {
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);
    equal(warnings.length, 0);
    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof TestError);
    ok(error2 instanceof SkipFailedEntryError);
  });

  it('assert :: prevent post action (create dependency error)', async () => {
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

    const { errors, warnings } = await applySteps(steps, baseState, undefined, {
      handlers
    });

    equal(createHandlerA.mock.callCount(), 0);
    equal(createHandlerC.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);
    equal(warnings.length, 0);
    equal(errors.length, 3);

    const [error1, error2, error3] = errors;

    ok(error1 instanceof TestError);
    ok(error2 instanceof SkipFailedEntryDependencyError);
    ok(error3 instanceof SkipFailedEntryDependencyError);
  });

  it('assert :: prevent post action (update dependency error)', async () => {
    const postActionHandler = mock.fn(() => {});

    const updateHandlerA = mock.fn((_candidate: TestEntryState, _current: TestEntryState, context: StepContext) => {
      context.postAction(postActionHandler);
    });

    const updateHandlerC = mock.fn(() => {
      throw new TestError();
    });

    const handlers: StepHandlers<TestEntryState> = {
      ...commonStepHandlers,
      [TestEntryType.A]: {
        ...commonStepHandler,
        update: updateHandlerA
      },
      [TestEntryType.C]: {
        ...commonStepHandler,
        update: updateHandlerC
      }
    };

    const newState = { ...baseState };

    const steps = await planSteps(newState, baseState, {
      handlers
    });

    const { errors, warnings } = await applySteps(steps, newState, baseState, {
      handlers
    });

    equal(updateHandlerA.mock.callCount(), 0);
    equal(updateHandlerC.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);
    equal(warnings.length, 0);
    equal(errors.length, 3);

    const [error1, error2, error3] = errors;

    ok(error1 instanceof TestError);
    ok(error2 instanceof SkipFailedEntryDependencyError);
    ok(error3 instanceof SkipFailedEntryDependencyError);
  });

  it('assert :: prevent post action (replace dependency error)', async () => {
    const postActionHandler = mock.fn(() => {});

    const updateHandlerA = mock.fn((_candidate: TestEntryState, _current: TestEntryState, context: StepContext) => {
      context.postAction(postActionHandler);
    });

    const replaceHandlerE = mock.fn(() => {
      throw new TestError();
    });

    const handlers: StepHandlers<TestEntryState> = {
      ...commonStepHandlers,
      [TestEntryType.A]: {
        ...commonStepHandler,
        update: updateHandlerA
      },
      [TestEntryType.E]: {
        ...commonStepHandler,
        replace: replaceHandlerE
      }
    };

    const newState = {
      ...baseState,
      entryC: {
        ...(baseState.entryC as any),
        type: TestEntryType.E
      }
    };

    const steps = await planSteps(newState, baseState, {
      handlers
    });

    const { errors, warnings } = await applySteps(steps, newState, baseState, {
      handlers
    });

    equal(updateHandlerA.mock.callCount(), 0);
    equal(replaceHandlerE.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);
    equal(warnings.length, 0);
    equal(errors.length, 3);

    const [error1, error2, error3] = errors;

    ok(error1 instanceof TestError);
    ok(error2 instanceof SkipFailedEntryDependencyError);
    ok(error3 instanceof SkipFailedEntryDependencyError);
  });

  it('assert :: prevent post action (create entry warning)', async () => {
    const postActionHandler = mock.fn(() => {});

    const createHandler = mock.fn((_candidate: TestEntryState, context: StepContext) => {
      context.postAction(postActionHandler);
      context.addWarning('Test warning');
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

    const { errors, warnings } = await applySteps(steps, baseState, undefined, {
      handlers
    });

    equal(createHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);

    equal(warnings.length, 1);

    const [warning1] = warnings;

    deepEqual(warning1, { message: 'Test warning' });

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof SkipFailedEntryError);
  });

  it('assert :: prevent post action (update entry warning)', async () => {
    const postActionHandler = mock.fn(() => {});

    const updateHandler = mock.fn((_candidate: TestEntryState, _current: TestEntryState, context: StepContext) => {
      context.postAction(postActionHandler);
      context.addWarning('Test warning');
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

    const { errors, warnings } = await applySteps(steps, baseState, newState, {
      force: true,
      handlers
    });

    equal(updateHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);

    equal(warnings.length, 1);

    const [warning1] = warnings;

    deepEqual(warning1, { message: 'Test warning' });

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof SkipFailedEntryError);
  });

  it('assert :: prevent post action (replace entry warning)', async () => {
    const postActionHandler = mock.fn(() => {});

    const replaceHandler = mock.fn((_candidate: TestEntryState, _current: TestEntryState, context: StepContext) => {
      context.postAction(postActionHandler);
      context.addWarning('Test warning');
    });

    const handlers: StepHandlers<TestEntryState> = {
      ...commonStepHandlers,
      [TestEntryType.B]: {
        ...commonStepHandler,
        replace: replaceHandler
      }
    };

    const newState = {
      ...baseState,
      entryA: {
        ...(baseState.entryA as any),
        type: TestEntryType.B
      }
    };

    const steps = await planSteps(newState, baseState, {
      handlers
    });

    const { errors, warnings } = await applySteps(steps, newState, baseState, {
      force: true,
      handlers
    });

    equal(replaceHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);

    equal(warnings.length, 1);

    const [warning1] = warnings;

    deepEqual(warning1, { message: 'Test warning' });

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof SkipFailedEntryError);
  });

  it('assert :: prevent post action (delete entry warning)', async () => {
    const postActionHandler = mock.fn(() => {});

    const deleteHandler = mock.fn((_candidate: TestEntryState, context: StepContext) => {
      context.postAction(postActionHandler);
      context.addWarning('Test warning');
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

    const { errors, warnings } = await applySteps(steps, undefined, baseState, {
      force: true,
      handlers
    });

    equal(deleteHandler.mock.callCount(), 1);
    equal(postActionHandler.mock.callCount(), 0);

    equal(warnings.length, 1);

    const [warning1] = warnings;

    deepEqual(warning1, { message: 'Test warning' });

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof SkipFailedEntryError);
  });
});
