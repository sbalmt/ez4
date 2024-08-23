import type { Arn } from '@ez4/aws-common';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { AuthorizerState } from './types.js';

import { getRegion } from '@ez4/aws-identity';

import { AuthorizerServiceType } from './types.js';

export const getAuthorizerUri = async (functionArn: Arn) => {
  const region = await getRegion();

  return `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${functionArn}/invocations`;
};

export const getAuthorizerId = <E extends EntryState>(
  context: StepContext<E | AuthorizerState>
) => {
  const resource = context.getDependencies(AuthorizerServiceType).at(0)?.result;

  return resource?.authorizerId;
};
