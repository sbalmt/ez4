import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client';

export const ResponseServiceName = 'AWS:API/Response';

export const ResponseServiceType = 'aws:api.response';

export type ResponseParameters = CreateRequest;

export type ResponseResult = CreateResponse & {
  routeId: string;
  apiId: string;
};

export type ResponseState = EntryState & {
  type: typeof ResponseServiceType;
  parameters: ResponseParameters;
  result?: ResponseResult;
};
