import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isEmailService } from '@ez4/email/library';

import { createIdentity } from '../identity/service';
import { prepareLinkedClient } from './client';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isEmailService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareServices = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isEmailService(service)) {
    return false;
  }

  const { domain } = service;

  const identityState = createIdentity(state, {
    identity: domain,
    tags: options.tags
  });

  context.setServiceState(service, options, identityState);

  return true;
};
