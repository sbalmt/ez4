import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionParameters } from './types.js';

import { createFunction as baseCreateFunction } from '@ez4/aws-function';

import { bundleApiFunction } from './helpers/bundler.js';

export const createFunction = async <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: FunctionParameters
) => {
  const sourceFile = await bundleApiFunction(parameters);

  return baseCreateFunction(state, roleState, {
    ...parameters,
    handlerName: 'apiEntryPoint',
    sourceFile
  });
};
