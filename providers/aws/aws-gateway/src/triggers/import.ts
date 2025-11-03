import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import { isHttpImport } from '@ez4/gateway/library';

import { createGateway } from '../gateway/service';
import { prepareLinkedClient } from './client';

export const prepareLinkedImports = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (!isHttpImport(service)) {
    return null;
  }

  const { project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  return prepareLinkedClient(context, service, imports[project]);
};

export const prepareImports = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isHttpImport(service)) {
    return false;
  }

  const { project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  const { name, displayName, description } = service;

  const gatewayState = createGateway(state, {
    gatewayId: getServiceName(service, options),
    gatewayName: displayName ?? name,
    description,
    import: true
  });

  context.setServiceState(gatewayState, service, imports[project]);

  return true;
};
