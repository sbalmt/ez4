import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionParameters, FunctionState } from './types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { FunctionServiceType } from './types';

export const createViewerFunction = <E extends EntryState>(state: EntryStates<E>, parameters: FunctionParameters) => {
  const functionId = hashData(FunctionServiceType, parameters.functionName);

  return attachEntry<E | FunctionState, FunctionState>(state, {
    type: FunctionServiceType,
    entryId: functionId,
    dependencies: [],
    parameters
  });
};
