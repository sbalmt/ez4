import { registerProvider } from '@ez4/aws-common';

import { getGatewayHandler } from './gateway/handler.js';
import { GatewayServiceType } from './gateway/types.js';

import { getStageHandler } from './stage/handler.js';
import { StageServiceType } from './stage/types.js';

import { getIntegrationHandler } from './integration/handler.js';
import { IntegrationServiceType } from './integration/types.js';

import { getRouteHandler } from './route/handler.js';
import { RouteServiceType } from './route/types.js';

export * from './types/variables.js';

export * from './gateway/service.js';
export * from './gateway/types.js';
export * from './gateway/utils.js';

export * from './stage/service.js';
export * from './stage/types.js';

export * from './integration/service.js';
export * from './integration/types.js';
export * from './integration/utils.js';

export * from './route/service.js';
export * from './route/types.js';

export * from './function/service.js';
export * from './function/types.js';

export * from './triggers/register.js';

registerProvider(GatewayServiceType, getGatewayHandler());
registerProvider(StageServiceType, getStageHandler());
registerProvider(IntegrationServiceType, getIntegrationHandler());
registerProvider(RouteServiceType, getRouteHandler());
