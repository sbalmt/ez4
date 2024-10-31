import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { TargetFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';
import { linkDependency } from '@ez4/stateful';

import { bundleTargetFunction } from './bundler.js';

export const createTargetFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: TargetFunctionParameters
) => {
  const resource = createFunction(state, roleState, {
    ...parameters,
    handlerName: 'eventEntryPoint',
    getFunctionBundle: (context) => {
      const dependencies = context.getDependencies();

      return bundleTargetFunction(dependencies, parameters);
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
