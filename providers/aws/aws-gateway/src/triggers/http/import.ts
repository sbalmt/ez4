import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import { isHttpImport } from '@ez4/gateway/library';

import { createGateway } from '../../gateway/service';
import { GatewayProtocol } from '../../gateway/types';
import { prepareLinkedClient } from './client';

export const prepareHttpLinkedImport = (event: ServiceEvent) => {
  const { service, options, context } = event;
  const { imports } = options;

  if (isHttpImport(service)) {
    const { project } = service;

    if (!imports || !imports[project]) {
      throw new MissingImportedProjectError(project);
    }

    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareHttpImports = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;
  const { imports } = options;

  if (isHttpImport(service)) {
    const { project } = service;

    if (!imports || !imports[project]) {
      throw new MissingImportedProjectError(project);
    }

    const { name, displayName, description } = service;

    const gatewayState = createGateway(state, {
      gatewayId: getServiceName(service, options),
      gatewayName: displayName ?? name,
      protocol: GatewayProtocol.Http,
      description,
      import: true
    });

    context.setServiceState(service, options, gatewayState);

    return true;
  }

  return false;
};
