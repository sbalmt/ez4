import type { RoleDocument } from '@ez4/aws-identity';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { CreateResponse } from './client.js';

export const PolicyServiceName = 'AWS:S3/Policy';

export const PolicyServiceType = 'aws:s3.policy';

export type GetRole = (context: StepContext) => Promise<RoleDocument> | RoleDocument;

export type PolicyParameters = {
  fromService: string;
  getRole: GetRole;
};

export type PolicyResult = CreateResponse;

export type PolicyState = EntryState & {
  type: typeof PolicyServiceType;
  parameters: PolicyParameters;
  result?: PolicyResult;
};
