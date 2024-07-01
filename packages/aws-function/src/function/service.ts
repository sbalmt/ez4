import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionParameters, FunctionState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { FunctionServiceType } from './types.js';

export const isFunction = (resource: EntryState): resource is FunctionState => {
  return resource.type === FunctionServiceType;
};

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
  const functionId = hashData(toKebabCase(functionName));
  const functionState = state[(roleState.entryId, functionId)];

  if (functionState && isFunction(functionState)) {
    return functionState;
  }

  return null;
};
