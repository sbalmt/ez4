import type { EmulateServiceEvent, LinkServiceEvent, PrepareResourceEvent, ServiceEmulator } from '@ez4/project/library';
import type { ReflectionTypes } from '@ez4/reflection';

import { createServiceMetadata, getServiceName } from '@ez4/project/library';

import { ServiceName, ServiceType, isCommonService } from '../metadata/types';
import { createVirtualState } from '../virtual/service';
import { prepareLinkedClient } from './client';

export const prepareLinkedServices = (event: LinkServiceEvent) => {
  const { target, service } = event;

  if (isCommonService(service)) {
    return prepareLinkedClient(target, service);
  }

  return null;
};

export const prepareCommonServices = (event: PrepareResourceEvent) => {
  const { service, options, context } = event;

  if (isCommonService(service)) {
    context.setVirtualServiceState(service, options, createVirtualState(service));
    return true;
  }

  return false;
};

export const getCommonServices = (_reflection: ReflectionTypes) => {
  return {
    errors: [],
    services: {
      [ServiceName.Variables]: createServiceMetadata(ServiceType, ServiceName.Variables),
      [ServiceName.Options]: createServiceMetadata(ServiceType, ServiceName.Options)
    }
  };
};

export const getCommonEmulators = (event: EmulateServiceEvent): ServiceEmulator | null => {
  const { service, options } = event;

  if (!isCommonService(service)) {
    return null;
  }

  const { name: resourceName } = service;

  return {
    type: 'Common',
    name: resourceName,
    options: service.options,
    inheritOptions: true,
    identifier: getServiceName(resourceName, options),
    exportDescriptor: (options) => {
      if (resourceName === ServiceName.Variables) {
        return {
          name: 'makeVariables',
          module: '@ez4/common/worker'
        };
      }

      return {
        name: 'makeOptions',
        module: '@ez4/common/worker',
        options
      };
    }
  };
};
