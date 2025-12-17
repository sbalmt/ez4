import type { EventContext } from '@ez4/project/library';
import type { LinkedServices, LinkedVariables, LinkedContext, ServiceMetadata } from '../types/service';
import type { MetadataReflection } from '../types/metadata';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

import { DuplicateVariablesError } from '../errors/variables';

export const prepareLinkedServices = async (metadata: MetadataReflection, context: EventContext, options: DeployOptions) => {
  for (const identity in metadata) {
    const target = metadata[identity];

    if (target.services) {
      const linkedContext = await prepareLinkedContext(target.services, metadata, options, context);

      Object.assign(target.context, linkedContext);
    }
  }
};

const prepareLinkedContext = async (
  services: LinkedServices,
  metadata: MetadataReflection,
  options: DeployOptions,
  context: EventContext
) => {
  const linkedContext: Record<string, LinkedContext> = {};

  for (const alias in services) {
    const identity = services[alias];
    const service = metadata[identity];

    const linkedService = await triggerAllAsync('deploy:prepareLinkedService', (handler) =>
      handler({
        service,
        options,
        context
      })
    );

    if (linkedService) {
      const { variables, services, ...linkedServiceContext } = linkedService;

      if (variables) {
        assignServiceVariables(service, variables);
      }

      linkedContext[alias] = {
        context: services && (await prepareLinkedContext(services, metadata, options, context)),
        ...linkedServiceContext
      };
    }
  }

  return linkedContext;
};

const assignServiceVariables = (service: ServiceMetadata, variables: LinkedVariables) => {
  if (!service.variables) {
    service.variables = variables;
  }

  for (const alias in variables) {
    if (alias in service.variables && service.variables[alias] !== variables[alias]) {
      throw new DuplicateVariablesError(alias, service.name);
    }

    service.variables[alias] = variables[alias];
  }
};
