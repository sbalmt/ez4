import type { DeployOptions, ContextSource, EventContext } from '@ez4/project/library';
import type { HttpImport, HttpService } from '@ez4/gateway/library';
import type { GatewayState } from '../gateway/types';

import { getClientOperations } from '@ez4/gateway/library';
import { getDefinitionName } from '@ez4/project/library';

import { getGatewayState } from '../gateway/utils';

export const prepareLinkedClient = (context: EventContext, service: HttpService | HttpImport, options: DeployOptions): ContextSource => {
  const gatewayState = getGatewayState(context, service.name, options);
  const gatewayId = gatewayState.entryId;

  const gatewayUrl = getDefinitionName<GatewayState>(gatewayId, 'endpoint');
  const operations = JSON.stringify(getClientOperations(service));

  return {
    connectionIds: [gatewayId],
    dependencyIds: [gatewayId],
    constructor: `make(${gatewayUrl}, ${operations})`,
    from: '@ez4/aws-gateway/client',
    module: 'Client'
  };
};
