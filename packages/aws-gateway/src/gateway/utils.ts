import type { EntryState, StepContext } from '@ez4/stateful';
import type { GatewayState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { GatewayServiceType } from './types.js';

export const getGatewayId = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | GatewayState>
) => {
  const resource = context.getDependencies(GatewayServiceType).at(0)?.result;

  if (!resource?.apiId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'apiId');
  }

  return resource.apiId;
};
