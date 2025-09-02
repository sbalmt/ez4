import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client';

export const GatewayServiceName = 'AWS:API/Gateway';

export const GatewayServiceType = 'aws:api.gateway';

export type GatewayParameters = CreateRequest & {
  gatewayId: string;
};

export type GatewayResult = CreateResponse;

export type GatewayState = EntryState & {
  type: typeof GatewayServiceType;
  parameters: GatewayParameters;
  result?: GatewayResult;
};
