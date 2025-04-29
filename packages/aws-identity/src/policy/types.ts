import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client.js';

export const PolicyServiceName = 'AWS:IAM/Policy';

export const PolicyServiceType = 'aws:iam.policy';

export type PolicyParameters = CreateRequest;

export type PolicyResult = ImportOrCreateResponse & {
  versionHistory: string[];
};

export type PolicyState = EntryState & {
  type: typeof PolicyServiceType;
  parameters: PolicyParameters;
  result?: PolicyResult;
};
