import type { DeployOptions, ExtraSource, EventContext } from '@ez4/project/library';
import type { HttpImport, HttpService } from '@ez4/gateway/library';
import type { GatewayState } from '../gateway/types';

import { getDefinitionName } from '@ez4/project/library';

import { getClientOperations } from '../client/utils';
import { getGatewayState } from '../gateway/utils';

export const prepareLinkedClient = (context: EventContext, service: HttpService | HttpImport, options: DeployOptions): ExtraSource => {
  const gatewayState = getGatewayState(context, service.name, options);
  const gatewayId = gatewayState.entryId;

  const gatewayUrl = getDefinitionName<GatewayState>(gatewayId, 'endpoint');
  const operations = JSON.stringify(getClientOperations(service));

  return {
    entryIds: [gatewayId],
    constructor: `make(${gatewayUrl}, ${operations})`,
    from: '@ez4/aws-gateway/client',
    module: 'Client'
  };
};
