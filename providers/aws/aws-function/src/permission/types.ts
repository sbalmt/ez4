import type { EntryState, StepContext } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client';

export const PermissionServiceName = 'AWS:Lambda/Permission';

export const PermissionServiceType = 'aws:lambda.permission';

export type Permission = Omit<CreateRequest, 'functionName' | 'statementId' | 'action'>;

export type GetPermission = (context: StepContext) => Promise<Permission> | Permission;

export type PermissionParameters = {
  getPermission: GetPermission;
  fromService: string;
};

export type PermissionResult = CreateResponse & {
  functionName: string;
};

export type PermissionState = EntryState & {
  type: typeof PermissionServiceType;
  parameters: PermissionParameters;
  result?: PermissionResult;
};
