import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { TypeClass } from '@ez4/reflection';

import { hashData } from '@ez4/utils';

import { isValidationServiceDeclaration } from '../metadata/service';
import { isValidationService, ServiceType } from '../metadata/types';
import { prepareLinkedClient } from './client';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isValidationServiceDeclaration(declaration) ? declaration.name : null;
};

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isValidationService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareResources = (event: PrepareResourceEvent) => {
  const { service, options, context } = event;

  if (!isValidationService(event.service)) {
    return false;
  }

  context.setServiceState(service, options, {
    entryId: hashData(ServiceType, service.name),
    type: ServiceType,
    dependencies: [],
    parameters: null
  });

  return true;
};
