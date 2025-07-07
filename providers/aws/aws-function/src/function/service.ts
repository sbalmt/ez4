import type { EntryState, EntryStates } from '@ez4/stateful';
import type { RoleState } from '@ez4/aws-identity';
import type { LogGroupState } from '@ez4/aws-logs';
import type { FunctionParameters, FunctionState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { FunctionServiceType } from './types.js';

export const createFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState | undefined,
  parameters: FunctionParameters
) => {
  const functionName = toKebabCase(parameters.functionName);
  const functionId = hashData(FunctionServiceType, roleState.entryId, functionName);

  const dependencies = [roleState.entryId];

  if (logGroupState) {
    dependencies.push(logGroupState.entryId);
  }

  return attachEntry<E | FunctionState, FunctionState>(state, {
    type: FunctionServiceType,
    entryId: functionId,
    dependencies,
    parameters: {
      ...parameters,
      functionName
    }
  });
};
