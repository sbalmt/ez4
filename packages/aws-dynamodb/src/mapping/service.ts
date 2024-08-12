import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { MappingParameters } from './types.js';

import { createMapping as baseCreateMapping, MappingServiceName } from '@ez4/aws-function';

import { getStreamArn } from '../table/utils.js';
import { TableState } from '../table/types.js';

export const createMapping = <E extends EntryState>(
  state: EntryStates<E>,
  tableState: TableState,
  functionState: FunctionState,
  parameters: MappingParameters
) => {
  return baseCreateMapping(state, tableState, functionState, {
    ...parameters,
    getSourceArn: (context: StepContext) => {
      return getStreamArn(MappingServiceName, 'stream', context);
    }
  });
};
