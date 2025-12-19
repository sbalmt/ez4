import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { TypeClass } from '@ez4/reflection';

import { isValidationServiceDeclaration } from '../metadata/service';
import { isValidationService } from '../metadata/types';
import { prepareLinkedClient } from './client';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isValidationServiceDeclaration(declaration) ? declaration.name : null;
};

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service } = event;

  if (isValidationService(service)) {
    return prepareLinkedClient(service);
  }

  return null;
};

export const prepareResources = (event: PrepareResourceEvent) => {
  return isValidationService(event.service);
};
