import type { StepHandler, StepHandlers } from '@ez4/stateful';
import type { TestEntryState } from './entry';

import { TestEntryType } from './entry';

export const commonStepHandler: StepHandler<TestEntryState> = {
  equals: (_candidate, _current) => true,
  create: (_candidate) => ({ type: 'created' }),
  replace: (_candidate, _current) => ({ type: 'replaced' }),
  preview: (_candidate, _current) => ({ counts: 1 }),
  update: (_candidate, _current) => ({ type: 'updated' }),
  delete: (_candidate) => {}
};

export const commonStepHandlers: StepHandlers<TestEntryState> = {
  [TestEntryType.A]: commonStepHandler,
  [TestEntryType.B]: commonStepHandler,
  [TestEntryType.C]: commonStepHandler,
  [TestEntryType.D]: commonStepHandler,
  [TestEntryType.E]: commonStepHandler
};
