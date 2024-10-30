import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { IntegrationFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';
import { linkDependency } from '@ez4/stateful';

import { bundleApiFunction } from './bundler.js';

export const createIntegrationFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: IntegrationFunctionParameters
) => {
  const resource = createFunction(state, roleState, {
    ...parameters,
    handlerName: 'apiEntryPoint',
    getFunctionBundle: () => {
      return bundleApiFunction(state, parameters);
    }
  });

  for (const serviceName in parameters.extras) {
    const { entryStateId } = parameters.extras[serviceName];

    if (entryStateId) {
      linkDependency(state, resource.entryId, entryStateId);
    }
  }

  return resource;
};
