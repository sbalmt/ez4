import type { EntryState, EntryStates } from '@ez4/stateful';
import type { InvalidationParameters, InvalidationState } from './types.js';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { DistributionState } from '../distribution/types.js';
import { InvalidationServiceType } from './types.js';

export const createInvalidation = <E extends EntryState>(
  state: EntryStates<E>,
  distributionState: DistributionState,
  parameters: InvalidationParameters
) => {
  const accessId = hashData(InvalidationServiceType, distributionState.entryId);

  return attachEntry<E | InvalidationState, InvalidationState>(state, {
    type: InvalidationServiceType,
    entryId: accessId,
    dependencies: [distributionState.entryId],
    parameters
  });
};
