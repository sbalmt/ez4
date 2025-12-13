import type { DeployOptions, ContextSource, EventContext } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { GatewayState } from '../../gateway/types';

import { getDefinitionName } from '@ez4/project/library';

import { getGatewayState } from '../../gateway/utils';
import { Defaults } from '../defaults';

export const prepareLinkedClient = (context: EventContext, service: WsService, options: DeployOptions): ContextSource => {
  const gatewayState = getGatewayState(context, service.name, options);
  const gatewayId = gatewayState.entryId;

  const gatewayUrl = getDefinitionName<GatewayState>(gatewayId, 'endpoint');

  const clientOptions = JSON.stringify({
    path: service.stageName ?? Defaults.StageName,
    preferences: service.message.preferences ?? service.defaults?.preferences,
    messageSchema: service.schema
  });

  return {
    connectionIds: [gatewayId],
    dependencyIds: [gatewayId],
    constructor: `make(${gatewayUrl}, ${clientOptions})`,
    from: '@ez4/aws-gateway/client',
    module: 'WsClient'
  };
};
