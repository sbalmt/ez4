import type { EntryState, EntryStates, StepContext } from '@ez4/state';
import type { FunctionState } from '@ez4/aws-function';
import type { MappingParameters } from './types';
import type { TableState } from '../table/types';

import { createMapping as createFunctionMapping, MappingServiceName } from '@ez4/aws-function';

import { getTableStreamArn } from '../table/utils';

export const createMapping = <E extends EntryState>(
  state: EntryStates<E>,
  tableState: TableState,
  functionState: FunctionState,
  parameters: MappingParameters
) => {
  return createFunctionMapping(state, tableState, functionState, {
    ...parameters,
    getSourceArn: (context: StepContext) => {
      return getTableStreamArn(MappingServiceName, 'stream', context);
    }
  });
};
