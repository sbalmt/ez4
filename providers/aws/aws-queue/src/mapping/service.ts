import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { QueueState } from '../queue/types.js';
import type { MappingParameters } from './types.js';

import { createMapping as baseCreateMapping, MappingServiceName } from '@ez4/aws-function';

import { getQueueArn } from '../queue/utils.js';

export const createMapping = <E extends EntryState>(
  state: EntryStates<E>,
  queueState: QueueState,
  functionState: FunctionState,
  parameters: MappingParameters
) => {
  return baseCreateMapping(state, queueState, functionState, {
    ...parameters,
    getSourceArn: (context: StepContext) => {
      return getQueueArn(MappingServiceName, 'queue', context);
    }
  });
};
