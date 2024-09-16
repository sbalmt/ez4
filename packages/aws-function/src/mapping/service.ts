import type { EntryState, EntryStates } from '@ez4/stateful';
import type { MappingParameters, MappingState } from './types.js';
import type { FunctionState } from '../function/types.js';

import { hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { MappingServiceType } from './types.js';

export const createMapping = <E extends EntryState>(
  state: EntryStates<E>,
  sourceState: EntryState,
  functionState: FunctionState,
  parameters: MappingParameters
) => {
  const mappingId = hashData(MappingServiceType, sourceState.entryId, functionState.entryId);

  return attachEntry<E | MappingState, MappingState>(state, {
    type: MappingServiceType,
    entryId: mappingId,
    dependencies: [sourceState.entryId, functionState.entryId],
    parameters
  });
};
