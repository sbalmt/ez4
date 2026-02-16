import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const IdentityServiceName = 'AWS:SES/Identity';

export const IdentityServiceType = 'aws:ses.identity';

export type IdentityParameters = CreateRequest;

export type IdentityResult = ImportOrCreateResponse;

export type IdentityState = EntryState & {
  type: typeof IdentityServiceType;
  parameters: IdentityParameters;
  result?: IdentityResult;
};
