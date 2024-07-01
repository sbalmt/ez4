import type { EntryState, StepContext } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const PermissionServiceName = 'AWS:Lambda/Permission';

export const PermissionServiceType = 'aws:lambda.permission';

export type PermissionParameters = Omit<CreateRequest, 'functionName' | 'statementId' | 'action'>;

export type PermissionResult = CreateResponse & {
  functionName: string;
};

export type PermissionParametersGenerator = (
  context: StepContext
) => Promise<PermissionParameters> | PermissionParameters;

export type PermissionState = EntryState & {
  type: typeof PermissionServiceType;
  parameters: PermissionParametersGenerator;
  result?: PermissionResult;
};
