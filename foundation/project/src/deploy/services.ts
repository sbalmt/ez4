import type { EventContext } from '@ez4/project/library';
import type { Complete } from '@ez4/utils';
import type { LinkedContext, LinkedServices, LinkedVariables, ServiceMetadata } from '../types/service';
import type { MetadataReflection } from '../types/metadata';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';
import { isObjectWith } from '@ez4/utils';

import { DuplicateVariablesError, MissingVariablesSupportError } from '../errors/variables';

export const prepareLinkedServices = async (metadata: MetadataReflection, context: EventContext, options: DeployOptions) => {
  const allPromises = [];

  for (const identity in metadata) {
    const target = metadata[identity];

    if (isObjectWith(target, ['services'])) {
      const promise = prepareLinkedContext(target, metadata, options, context);

      allPromises.push(promise);
    }
  }

  await Promise.all(allPromises);
};

const prepareLinkedContext = async (
  target: ServiceMetadata & Complete<Pick<ServiceMetadata, 'services'>>,
  metadata: MetadataReflection,
  options: DeployOptions,
  context: EventContext
) => {
  const getLinkedContext = async (services: LinkedServices) => {
    const linkedContext: Record<string, LinkedContext> = {};

    for (const serviceName in services) {
      const identity = services[serviceName];
      const service = metadata[identity];

      const linkedService = await triggerAllAsync('deploy:prepareLinkedService', (handler) => {
        return handler({ service, options, context });
      });

      if (linkedService) {
        const { variables, services, ...remaining } = linkedService;

        if (variables) {
          assignServiceVariables(target, variables);
        }

        linkedContext[serviceName] = {
          context: services && (await getLinkedContext(services)),
          ...remaining
        };
      }
    }

    return linkedContext;
  };

  const targetLinkedContext = await getLinkedContext(target.services);

  Object.assign(target.context, targetLinkedContext);
};

const assignServiceVariables = (service: ServiceMetadata, variables: LinkedVariables) => {
  if (!service.variables) {
    throw new MissingVariablesSupportError(service.name);
  }

  for (const alias in variables) {
    if (alias in service.variables && service.variables[alias] !== variables[alias]) {
      throw new DuplicateVariablesError(alias, service.name);
    }

    service.variables[alias] = variables[alias];
  }
};
