import type { EntryState } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const RoleServiceName = 'AWS:IAM/Role';

export const RoleServiceType = 'aws:iam.role';

export type RoleParameters = CreateRequest;

export type RoleResult = ImportOrCreateResponse & {
  policyArns: Arn[];
};

export type RoleState = EntryState & {
  type: typeof RoleServiceType;
  parameters: RoleParameters;
  result?: RoleResult;
};
