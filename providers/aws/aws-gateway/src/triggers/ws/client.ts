import type { DeployOptions, ContextSource, EventContext } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { GatewayState } from '../../gateway/types';

import { getDefinitionName } from '@ez4/project/library';

import { getGatewayState } from '../../gateway/utils';

export const prepareLinkedClient = (context: EventContext, service: WsService, options: DeployOptions): ContextSource => {
  const gatewayState = getGatewayState(context, service.name, options);
  const gatewayId = gatewayState.entryId;

  const gatewayUrl = getDefinitionName<GatewayState>(gatewayId, 'endpoint');

  const clientOptions = JSON.stringify({
    preferences: service.message.preferences ?? service.defaults?.preferences,
    messageSchema: service.schema,
    path: 'stream'
  });

  return {
    connectionIds: [gatewayId],
    dependencyIds: [gatewayId],
    constructor: `make(${gatewayUrl}, ${clientOptions})`,
    from: '@ez4/aws-gateway/client',
    module: 'WsClient'
  };
};
