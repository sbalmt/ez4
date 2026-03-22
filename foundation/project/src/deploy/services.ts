import type { EventContext } from '@ez4/project/library';
import type { Complete } from '@ez4/utils';
import type { ContextSource, LinkedContext, LinkedServices, LinkedVariables, ServiceMetadata } from '../types/service';
import type { MetadataReflection } from '../types/metadata';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';
import { isObjectWith } from '@ez4/utils';

import { DuplicateVariablesError, MissingVariablesSupportError } from '../errors/variables';

type LinkedContextRepository = Record<string, Pick<ContextSource, 'variables'> & { context: LinkedContext }>;

type TargetServiceMetadata = ServiceMetadata & Complete<Pick<ServiceMetadata, 'services'>>;

export const prepareLinkedServices = async (metadata: MetadataReflection, context: EventContext, options: DeployOptions) => {
  const repository: LinkedContextRepository = {};
  const operations = [];

  for (const identity in metadata) {
    const target = metadata[identity];

    if (isObjectWith(target, ['services'])) {
      operations.push(prepareLinkedContext(target, repository, metadata, options, context));
    }
  }

  await Promise.all(operations);
};

const prepareLinkedContext = async (
  target: TargetServiceMetadata,
  repository: LinkedContextRepository,
  metadata: MetadataReflection,
  options: DeployOptions,
  context: EventContext
) => {
  const getLinkedContext = async (services: LinkedServices) => {
    const result: Record<string, LinkedContext> = {};

    for (const serviceName in services) {
      const identity = services[serviceName];
      const service = metadata[identity];

      if (repository[identity]) {
        const { context: contextCache, variables: variablesCache } = repository[identity];

        result[serviceName] = contextCache;

        if (variablesCache) {
          assignServiceVariables(target, variablesCache);
        }

        continue;
      }

      const linkedService = await triggerAllAsync('deploy:prepareLinkedService', (handler) => {
        return handler({ service, options, context });
      });

      if (linkedService) {
        const { variables, services, ...remaining } = linkedService;

        repository[identity] = {
          context: (result[serviceName] = { ...remaining }),
          variables
        };

        if (services) {
          result[serviceName].context = await getLinkedContext(services);
        }

        if (variables) {
          assignServiceVariables(target, variables);
        }
      }
    }

    return result;
  };

  const linkedContext = await getLinkedContext(target.services);

  Object.assign(target.context, linkedContext);
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
