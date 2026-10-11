import type { ServiceDescriptors, ServiceReferences } from '@ez4/emulator';
import type { AnyObject } from '@ez4/utils';
import type { EmulatorLinkedServices, ServiceEmulator } from './types';
import type { MetadataReflection } from '../types/metadata';
import type { ServeOptions } from '../types/options';
import type { ServiceNameOptions } from '../utils/service';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';
import { hashObject, toSnakeCase } from '@ez4/utils';

import { MissingEmulatorProvider } from './errors';
import { loadServiceClient } from './client';

export type ServiceEmulators = Record<string, ServiceEmulator>;

export const getServiceEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const emulators: ServiceEmulators = {};

  const context = {
    makeService: (resourceName: string, resourceOptions?: AnyObject) => {
      return loadServiceClient(emulators, options, resourceName, resourceOptions);
    },
    makeReferences: (linkedServices: EmulatorLinkedServices, linkedReferences?: string[], linkedOptions?: AnyObject) => {
      return makeServiceReferences(linkedServices, emulators, options, linkedReferences, linkedOptions);
    },
    makeDescriptors: (linkedServices: EmulatorLinkedServices) => {
      return makeServiceDescriptors(linkedServices, emulators, options);
    }
  };

  for (const identity in metadata) {
    const service = metadata[identity];

    const result = await triggerAllAsync('emulator:getServices', (handler) =>
      handler({
        service,
        options,
        context
      })
    );

    if (!result) {
      throw new MissingEmulatorProvider(service.name);
    }

    if (result) {
      emulators[result.identifier] = result;
    }
  }

  return emulators;
};

export const makeServiceReferences = (
  linkedServices: EmulatorLinkedServices,
  emulators: ServiceEmulators,
  options: ServiceNameOptions,
  linkedReferences?: string[],
  linkedOptions?: AnyObject
) => {
  const references: ServiceReferences = {};

  for (const linkedName in linkedServices) {
    const { reference: resourceName, options: resourceOptions } = linkedServices[linkedName];

    const ownOptions = getServiceOptions(resourceName, resourceOptions, linkedOptions, emulators, options);
    const identifier = getServiceIdentifier(resourceName, ownOptions);

    if (!linkedReferences || linkedReferences?.includes(linkedName)) {
      references[linkedName] = identifier;
    }
  }

  return references;
};

export const makeServiceDescriptors = (
  linkedServices: EmulatorLinkedServices,
  emulators: ServiceEmulators,
  options: ServiceNameOptions
) => {
  const descriptors: ServiceDescriptors = {};

  const buildContext = (linkedServices: EmulatorLinkedServices, linkedOptions?: AnyObject) => {
    for (const linkedName in linkedServices) {
      const { reference: resourceName, options: resourceOptions } = linkedServices[linkedName];

      const ownOptions = getServiceOptions(resourceName, resourceOptions, linkedOptions, emulators, options);
      const identifier = getServiceIdentifier(resourceName, ownOptions);

      if (!descriptors[identifier]) {
        const { serviceOptions, serviceDescriptor } = getServiceDescriptor(resourceName, ownOptions, emulators, options);
        const { dependencies, ...descriptor } = serviceDescriptor;

        descriptors[identifier] = descriptor;

        if (dependencies) {
          buildContext(dependencies, serviceOptions);
        }
      }
    }
  };

  buildContext(linkedServices);

  return descriptors;
};

const getServiceDescriptor = (
  resourceName: string,
  resourceOptions: AnyObject | undefined,
  emulators: ServiceEmulators,
  options: ServiceNameOptions
) => {
  const serviceName = getServiceName(resourceName, options);
  const serviceEmulator = emulators[serviceName];

  if (!serviceEmulator) {
    throw new Error(`Service '${resourceName}' has no emulators.`);
  }

  const serviceOptions = {
    ...serviceEmulator.options,
    ...resourceOptions
  };

  const serviceDescriptor = serviceEmulator.exportDescriptor?.(serviceOptions);

  if (!serviceDescriptor) {
    throw new Error(`Service '${resourceName}' has no service descriptor.`);
  }

  return {
    serviceOptions,
    serviceDescriptor
  };
};

const getServiceOptions = (
  resourceName: string,
  resourceOptions: AnyObject | undefined,
  linkedOptions: AnyObject | undefined,
  emulators: ServiceEmulators,
  options: ServiceNameOptions
) => {
  if (resourceOptions) {
    return resourceOptions;
  }

  const serviceName = getServiceName(resourceName, options);
  const serviceEmulator = emulators[serviceName];

  return serviceEmulator?.inheritOptions ? linkedOptions : undefined;
};

const getServiceIdentifier = (resourceName: string, resourceOptions: AnyObject | undefined) => {
  const serviceHash = hashObject({ resourceName, resourceOptions });

  return `__EZ4_${toSnakeCase(serviceHash).toUpperCase()}`;
};
