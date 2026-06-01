import type { EventContext } from '@ez4/project/library';
import type { Complete } from '@ez4/utils';
import type { LinkedContext, LinkedServices, LinkedVariables, ServiceMetadata } from '../types/service';
import type { MetadataReflection } from '../types/metadata';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';
import { hashObject, isObjectWith } from '@ez4/utils';

import { DuplicateVariablesError, MissingVariablesSupportError } from '../errors/variables';

type TargetServiceMetadata = ServiceMetadata & Complete<Pick<ServiceMetadata, 'services'>>;

type LinkedContextCache = Record<string, LinkedContext>;

export const prepareLinkedServices = async (metadata: MetadataReflection, context: EventContext, options: DeployOptions) => {
  const operations = [];

  for (const serviceName in metadata) {
    const target = metadata[serviceName];

    if (isObjectWith(target, ['services'])) {
      operations.push(prepareLinkedContext(target, metadata, options, context));
    }
  }

  await Promise.all(operations);
};

const prepareLinkedContext = async (
  target: TargetServiceMetadata,
  metadata: MetadataReflection,
  options: DeployOptions,
  context: EventContext
) => {
  const contextCache: LinkedContextCache = {};

  const buildLinkedContexts = async (linkedTarget: ServiceMetadata, linkedServices: LinkedServices) => {
    const linkedContexts: Record<string, LinkedContext> = {};

    for (const linkedName in linkedServices) {
      const { reference: serviceName, options: serviceOptions } = linkedServices[linkedName];

      const baseService = metadata[serviceName];

      const linkedService = {
        ...baseService,
        options: {
          ...baseService.options,
          ...serviceOptions
        }
      };

      const contextSource = await triggerAllAsync('deploy:prepareLinkedService', (handler) => {
        return handler({ target: linkedTarget, service: linkedService, options, context });
      });

      if (contextSource) {
        const { variables, services, ...remaining } = contextSource;

        linkedContexts[linkedName] = remaining;

        const linkedKey = hashObject({ serviceName, serviceOptions: remaining.options });

        if (contextCache[linkedKey]) {
          linkedContexts[linkedName].context = contextCache[linkedKey].context;
        } else if (services) {
          linkedContexts[linkedName].context = {};

          contextCache[linkedKey] = linkedContexts[linkedName];

          const subContext = await buildLinkedContexts(linkedService, services);

          Object.assign(linkedContexts[linkedName].context, subContext);
        }

        if (variables) {
          assignServiceVariables(target, variables);
        }
      }
    }

    return linkedContexts;
  };

  const linkedContexts = await buildLinkedContexts(target, target.services);

  Object.assign(target.context, linkedContexts);
};

const assignServiceVariables = (service: TargetServiceMetadata, variables: LinkedVariables) => {
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
