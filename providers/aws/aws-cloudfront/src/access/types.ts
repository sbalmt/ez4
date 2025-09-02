import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client';

export const AccessServiceName = 'AWS:CloudFront/Access';

export const AccessServiceType = 'aws:cloudfront.access';

export type AccessParameters = CreateRequest;

export type AccessResult = CreateResponse;

export type AccessState = EntryState & {
  type: typeof AccessServiceType;
  parameters: AccessParameters;
  result?: AccessResult;
};
