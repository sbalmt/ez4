import type { EntryState, EntryStates, StepContext } from '@ez4/state';
import type { FunctionState } from '@ez4/aws-function';
import type { MappingParameters } from './types';
import type { TableState } from '../table/types';

import { createMapping as createFunctionMapping, MappingServiceName } from '@ez4/aws-function';
import { StreamChangeType } from '@ez4/database';

import { getTableStreamArn } from '../table/utils';

const EVENT_NAMES = {
  [StreamChangeType.Insert]: 'INSERT',
  [StreamChangeType.Update]: 'MODIFY',
  [StreamChangeType.Delete]: 'REMOVE'
};

export const createMapping = <E extends EntryState>(
  state: EntryStates<E>,
  tableState: TableState,
  functionState: FunctionState,
  parameters: MappingParameters
) => {
  const { triggers, ...mappingParameters } = parameters;

  return createFunctionMapping(state, tableState, functionState, {
    ...mappingParameters,
    filters: getFilters(triggers),
    getSourceArn: (context: StepContext) => {
      return getTableStreamArn(MappingServiceName, 'stream', context);
    }
  });
};

const getFilters = (triggers: StreamChangeType[] | undefined) => {
  if (triggers && triggers.length !== 3) {
    return triggers.map((trigger) =>
      JSON.stringify({
        eventName: [EVENT_NAMES[trigger]]
      })
    );
  }

  return [];
};
