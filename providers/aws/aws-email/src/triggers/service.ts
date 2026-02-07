import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isEmailService } from '@ez4/email/library';

import { createIdentity } from '../identity/service';
import { prepareLinkedClient } from './client';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service } = event;

  if (isEmailService(service)) {
    return prepareLinkedClient();
  }

  return null;
};

export const prepareServices = (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isEmailService(service)) {
    return false;
  }

  const { domain } = service;

  createIdentity(state, {
    identity: domain,
    tags: options.tags
  });

  return true;
};
