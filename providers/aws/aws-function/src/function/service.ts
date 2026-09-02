import type { EntryState, EntryStates } from '@ez4/state';
import type { RoleState } from '@ez4/aws-identity';
import type { LogGroupState } from '@ez4/aws-logs';
import type { FunctionParameters, FunctionState } from './types';

import { attachEntry, tryLinkEntryDependency } from '@ez4/state';
import { toKebabCase, hashData } from '@ez4/utils';

import { FunctionServiceType } from './types';

export const createFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState | undefined,
  parameters: FunctionParameters
) => {
  const { dependencies = [], ...inputParameters } = parameters;

  const functionName = toKebabCase(parameters.functionName);
  const functionId = hashData(FunctionServiceType, roleState.entryId, functionName);

  const functionState = attachEntry<E | FunctionState, FunctionState>(state, {
    type: FunctionServiceType,
    entryId: functionId,
    dependencies,
    parameters: {
      ...inputParameters,
      functionName
    }
  });

  dependencies.push(roleState.entryId);

  if (logGroupState) {
    dependencies.push(logGroupState.entryId);
  }

  dependencies.forEach((dependencyId) => {
    tryLinkEntryDependency(state, functionId, dependencyId);
  });

  return functionState;
};
