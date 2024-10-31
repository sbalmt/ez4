import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { TargetFunctionParameters } from './types.js';

import { linkServiceExtras } from '@ez4/project/library';
import { createFunction } from '@ez4/aws-function';

import { bundleTargetFunction } from './bundler.js';

export const createTargetFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: TargetFunctionParameters
) => {
  const resource = createFunction(state, roleState, {
    handlerName: 'eventEntryPoint',
    functionName: parameters.functionName,
    sourceFile: parameters.sourceFile,
    variables: parameters.variables,
    description: parameters.description,
    timeout: parameters.timeout,
    memory: parameters.memory,
    tags: parameters.tags,
    getFunctionBundle: (context) => {
      const dependencies = context.getDependencies();

      return bundleTargetFunction(dependencies, parameters);
    }
  });

  if (parameters.extras) {
    linkServiceExtras(state, resource.entryId, parameters.extras);
  }

  return resource;
};
