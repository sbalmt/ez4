import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionParameters, FunctionState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { FunctionServiceType } from './types.js';
import { isFunctionState } from './utils.js';

export const createFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: FunctionParameters
) => {
  const functionName = toKebabCase(parameters.functionName);
  const functionId = hashData(FunctionServiceType, roleState.entryId, functionName);

  return attachEntry<E | FunctionState, FunctionState>(state, {
    type: FunctionServiceType,
    entryId: functionId,
    dependencies: [roleState.entryId],
    parameters: {
      ...parameters,
      functionName
    }
  });
};

export const getFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  functionName: string
) => {
  const formattedName = toKebabCase(functionName);
  const functionId = hashData(FunctionServiceType, roleState.entryId, formattedName);

  const functionState = state[functionId];

  if (functionState && isFunctionState(functionState)) {
    return functionState;
  }

  return null;
};
