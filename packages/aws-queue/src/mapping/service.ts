import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { MappingParameters, MappingState } from './types.js';

import { hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { QueueState } from '../queue/types.js';
import { MappingServiceType } from './types.js';

export const isMapping = (resource: EntryState): resource is MappingState => {
  return resource.type === MappingServiceType;
};

export const createMapping = <E extends EntryState>(
  state: EntryStates<E>,
  queueState: QueueState,
  functionState: FunctionState,
  parameters: MappingParameters
) => {
  const mappingId = hashData(MappingServiceType, queueState.entryId, functionState.entryId);

  return attachEntry<E | MappingState, MappingState>(state, {
    type: MappingServiceType,
    entryId: mappingId,
    dependencies: [queueState.entryId, functionState.entryId],
    parameters
  });
};
