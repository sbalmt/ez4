import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';
import { linkDependency } from '@ez4/stateful';

import { bundleQueueFunction } from './bundler.js';

export const createQueueFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: QueueFunctionParameters
) => {
  const resource = createFunction(state, roleState, {
    handlerName: 'sqsEntryPoint',
    functionName: parameters.functionName,
    sourceFile: parameters.sourceFile,
    variables: parameters.variables,
    description: parameters.description,
    timeout: parameters.timeout,
    memory: parameters.memory,
    tags: parameters.tags,
    getFunctionBundle: (context) => {
      const dependencies = context.getDependencies();

      return bundleQueueFunction(dependencies, parameters);
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
