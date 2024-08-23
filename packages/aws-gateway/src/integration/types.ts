import type { Arn } from '@ez4/aws-common';
import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const IntegrationServiceName = 'AWS:API/Integration';

export const IntegrationServiceType = 'aws:api.integration';

export type IntegrationParameters = Omit<CreateRequest, 'functionArn'>;

export type IntegrationResult = CreateResponse & {
  apiId: string;
  functionArn: Arn;
};

export type IntegrationState = EntryState & {
  type: typeof IntegrationServiceType;
  parameters: IntegrationParameters;
  result?: IntegrationResult;
};
