import type { EmulateServiceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { ReflectionTypes } from '@ez4/reflection';

import { createServiceMetadata, getServiceName } from '@ez4/project/library';

import { Client } from '../client';
import { ServiceName, ServiceType, isCommonService } from '../metadata/types';
import { createVirtualState } from '../virtual/service';
import { prepareLinkedClient } from './client';

export const prepareLinkedServices = (event: ServiceEvent) => {
  return isCommonService(event.service) ? prepareLinkedClient() : null;
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
      [ServiceName]: createServiceMetadata(ServiceType, ServiceName)
    }
  };
};

export const getCommonEmulators = (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (!isCommonService(service)) {
    return null;
  }

  const { name: serviceName } = service;

  return {
    type: 'Common',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    exportHandler: () => Client.make()
  };
};
