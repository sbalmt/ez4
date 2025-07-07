import type { Arn } from '@ez4/aws-common';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { AuthorizerState } from './types.js';

import { getRegion } from '@ez4/aws-identity';

import { AuthorizerServiceType } from './types.js';

export const isAuthorizerState = (resource: EntryState): resource is AuthorizerState => {
  return resource.type === AuthorizerServiceType;
};

export const getAuthorizerUri = async (functionArn: Arn) => {
  const region = await getRegion();

  return `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${functionArn}/invocations`;
};

export const tryGetAuthorizerId = (context: StepContext) => {
  const resources = context.getDependencies<AuthorizerState>(AuthorizerServiceType);

  return resources[0]?.result?.authorizerId;
};
