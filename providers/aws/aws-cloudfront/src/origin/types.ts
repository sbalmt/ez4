import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const OriginServiceName = 'AWS:CloudFront/Origin';

export const OriginServiceType = 'aws:cloudfront.origin';

export type OriginParameters = CreateRequest;

export type OriginResult = ImportOrCreateResponse;

export type OriginState = EntryState & {
  type: typeof OriginServiceType;
  parameters: OriginParameters;
  result?: OriginResult;
};
