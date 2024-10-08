import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { TargetFunctionParameters } from './types.js';

import { createFunction as baseCreateFunction } from '@ez4/aws-function';

import { bundleTargetFunction } from './bundler.js';

export const createTargetFunction = async <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: TargetFunctionParameters
) => {
  const sourceFile = await bundleTargetFunction(parameters);

  return baseCreateFunction(state, roleState, {
    ...parameters,
    handlerName: 'eventEntryPoint',
    sourceFile
  });
};
