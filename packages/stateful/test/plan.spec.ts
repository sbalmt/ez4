import type { EntryStates } from '@ez4/stateful';
import type { TestEntryState } from './common/entry.js';

import { planSteps, StepAction } from '@ez4/stateful';
import { describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { commonStepHandlers } from './common/handler.js';
import { TestEntryType } from './common/entry.js';
import { ok } from 'node:assert';

const baseState: EntryStates<TestEntryState> = {
  // entryA needs to wait for entryC.
  entryA: {
    type: TestEntryType.A,
    entryId: 'entryA',
    dependencies: ['entryC'],
    parameters: {}
  },
  // entryB needs to wait for entryD.
  entryB: {
    type: TestEntryType.B,
    entryId: 'entryB',
    dependencies: ['entryD'],
    parameters: {}
  },
  // entryC needs to wait for entryB and entryD.
  entryC: {
    type: TestEntryType.C,
    entryId: 'entryC',
    dependencies: ['entryB', 'entryD'],
    parameters: {}
  },
  // entryD is the first to perform.
  entryD: {
    type: TestEntryType.D,
    entryId: 'entryD',
    dependencies: [],
    parameters: {}
  }
};

describe.only('plan tests', () => {
  it('assert :: create actions order', async () => {
    const steps = await planSteps(baseState, undefined, { handlers: commonStepHandlers });

    equal(steps.length, 4);

    equal(steps[0].action, StepAction.Create);
    equal(steps[0].entryId, 'entryD');
    equal(steps[0].order, 0);

    equal(steps[1].action, StepAction.Create);
    equal(steps[1].entryId, 'entryB');
    equal(steps[1].order, 1);

    equal(steps[2].action, StepAction.Create);
    equal(steps[2].entryId, 'entryC');
    equal(steps[2].order, 2);

    equal(steps[3].action, StepAction.Create);
    equal(steps[3].entryId, 'entryA');
    equal(steps[3].order, 3);
  });

  it('assert :: replace actions order', async () => {
    ok(baseState.entryC);

    const newState: EntryStates<TestEntryState> = {
      ...baseState,
      // entryC has changed its type.
      entryC: {
        ...baseState.entryC,
        type: TestEntryType.E
      }
    };

    const steps = await planSteps(newState, baseState, { handlers: commonStepHandlers });

    equal(steps.length, 4);

    equal(steps[0].action, StepAction.Update);
    equal(steps[0].entryId, 'entryD');
    equal(steps[0].order, 0);

    equal(steps[1].action, StepAction.Update);
    equal(steps[1].entryId, 'entryB');
    equal(steps[1].order, 1);

    equal(steps[2].action, StepAction.Replace);
    equal(steps[2].entryId, 'entryC');
    equal(steps[2].order, 2);

    equal(steps[3].action, StepAction.Update);
    equal(steps[3].entryId, 'entryA');
    equal(steps[3].order, 3);
  });

  it('assert :: update actions order', async () => {
    ok(baseState.entryA);

    const newState: EntryStates<TestEntryState> = {
      entryA: { ...baseState.entryA, dependencies: [] },
      entryB: baseState.entryB,
      entryD: baseState.entryD,
      // entryC: not specified, so it'll be deleted.
      entryE: {
        type: TestEntryType.E,
        entryId: 'entryE',
        dependencies: [],
        parameters: {}
      }
    };

    const steps = await planSteps(newState, baseState, { handlers: commonStepHandlers });

    equal(steps.length, 5);

    equal(steps[0].action, StepAction.Update);
    equal(steps[0].entryId, 'entryA');
    equal(steps[0].order, 0);

    equal(steps[1].action, StepAction.Update);
    equal(steps[1].entryId, 'entryD');
    equal(steps[1].order, 0);

    equal(steps[2].action, StepAction.Create);
    equal(steps[2].entryId, 'entryE');
    equal(steps[2].order, 0);

    equal(steps[3].action, StepAction.Update);
    equal(steps[3].entryId, 'entryB');
    equal(steps[3].order, 1);

    equal(steps[4].action, StepAction.Delete);
    equal(steps[4].entryId, 'entryC');
    equal(steps[4].order, 0);
  });

  it('assert :: delete actions order', async () => {
    const steps = await planSteps(undefined, baseState, { handlers: commonStepHandlers });

    equal(steps.length, 4);

    equal(steps[0].action, StepAction.Delete);
    equal(steps[0].entryId, 'entryA');
    equal(steps[0].order, 0);

    equal(steps[1].action, StepAction.Delete);
    equal(steps[1].entryId, 'entryC');
    equal(steps[1].order, 1);

    equal(steps[2].action, StepAction.Delete);
    equal(steps[2].entryId, 'entryB');
    equal(steps[2].order, 2);

    equal(steps[3].action, StepAction.Delete);
    equal(steps[3].entryId, 'entryD');
    equal(steps[3].order, 3);
  });
});
