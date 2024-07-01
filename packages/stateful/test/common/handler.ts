import type { StepHandler, StepHandlers } from '@ez4/stateful';
import type { TestEntryState } from './entry.js';

import { TestEntryType } from './entry.js';

export const commonStepHandler: StepHandler<TestEntryState> = {
  equals: (_candidate, _current) => true,
  create: (_candidate) => 'created',
  replace: (_candidate, _current) => 'replaced',
  update: (_candidate, _current) => 'updated',
  delete: (_candidate) => {}
};

export const commonStepHandlers: StepHandlers<TestEntryState> = {
  [TestEntryType.A]: commonStepHandler,
  [TestEntryType.B]: commonStepHandler,
  [TestEntryType.C]: commonStepHandler,
  [TestEntryType.D]: commonStepHandler,
  [TestEntryType.E]: commonStepHandler
};
