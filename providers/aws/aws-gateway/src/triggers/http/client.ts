import type { DeployOptions, ContextSource, EventContext } from '@ez4/project/library';
import type { HttpImport, HttpService } from '@ez4/gateway/library';
import type { GatewayState } from '../../gateway/types';

import { getClientAuthorization, getClientOperations, isHttpImport } from '@ez4/gateway/library';
import { getDefinitionName } from '@ez4/project/library';

import { getGatewayState } from '../../gateway/utils';

export const prepareLinkedClient = (context: EventContext, service: HttpService | HttpImport, options: DeployOptions): ContextSource => {
  const gatewayState = getGatewayState(context, service.name, options);
  const gatewayId = gatewayState.entryId;

  const gatewayUrl = getDefinitionName<GatewayState>(gatewayId, 'endpoint');

  const clientOptions = JSON.stringify({
    operations: getClientOperations(service),
    ...(isHttpImport(service) && {
      authorization: getClientAuthorization(service)
    })
  });

  return {
    module: 'HttpClient',
    from: '@ez4/aws-gateway/client',
    constructor: `@{EZ4_MODULE_IMPORT}.make(${gatewayUrl}, ${clientOptions})`,
    dependencyIds: [gatewayId],
    connectionIds: [gatewayId]
  };
};
