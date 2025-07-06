import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client.js';

export const RouteServiceName = 'AWS:API/Route';

export const RouteServiceType = 'aws:api.route';

export type RouteParameters = Omit<CreateRequest, 'integrationId'>;

export type RouteResult = ImportOrCreateResponse & {
  apiId: string;
  integrationId: string;
  authorizerId?: string;
};

export type RouteState = EntryState & {
  type: typeof RouteServiceType;
  parameters: RouteParameters;
  result?: RouteResult;
};
