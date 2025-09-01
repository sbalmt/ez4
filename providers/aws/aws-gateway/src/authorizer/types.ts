import type { Arn } from '@ez4/aws-common';
import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client';

export const AuthorizerServiceName = 'AWS:API/Authorizer';

export const AuthorizerServiceType = 'aws:api.authorizer';

export type AuthorizerParameters = Omit<CreateRequest, 'functionArn'>;

export type AuthorizerResult = CreateResponse & {
  apiId: string;
  functionArn: Arn;
};

export type AuthorizerState = EntryState & {
  type: typeof AuthorizerServiceType;
  parameters: AuthorizerParameters;
  result?: AuthorizerResult;
};
