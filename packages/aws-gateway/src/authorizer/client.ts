import type { Arn } from '@ez4/aws-common';

import {
  ApiGatewayV2Client,
  CreateAuthorizerCommand,
  UpdateAuthorizerCommand,
  DeleteAuthorizerCommand,
  AuthorizerType
} from '@aws-sdk/client-apigatewayv2';

import { Logger } from '@ez4/aws-common';

import { AuthorizerServiceName } from './types.js';
import { getAuthorizerUri } from './utils.js';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  name: string;
  functionArn: Arn;
  headerNames?: string[];
  queryNames?: string[];
  cacheTTL?: number;
};

export type CreateResponse = {
  authorizerId: string;
};

export type UpdateRequest = Partial<CreateRequest>;

export const createAuthorizer = async (
  apiId: string,
  request: CreateRequest
): Promise<CreateResponse> => {
  Logger.logCreate(AuthorizerServiceName, request.name);

  const { functionArn, headerNames, queryNames, cacheTTL } = request;

  const response = await client.send(
    new CreateAuthorizerCommand({
      ApiId: apiId,
      Name: request.name,
      IdentitySource: getIdentitySources({ headerNames, queryNames }),
      AuthorizerUri: await getAuthorizerUri(functionArn),
      AuthorizerType: AuthorizerType.REQUEST,
      AuthorizerPayloadFormatVersion: '2.0',
      AuthorizerResultTtlInSeconds: cacheTTL,
      EnableSimpleResponses: true
    })
  );

  return {
    authorizerId: response.AuthorizerId!
  };
};

export const updateAuthorizer = async (
  apiId: string,
  authorizerId: string,
  request: UpdateRequest
) => {
  Logger.logUpdate(AuthorizerServiceName, request.name ?? authorizerId);

  const { functionArn, headerNames, queryNames, cacheTTL } = request;

  await client.send(
    new UpdateAuthorizerCommand({
      ApiId: apiId,
      Name: request.name,
      AuthorizerId: authorizerId,
      IdentitySource: getIdentitySources({ headerNames, queryNames }),
      AuthorizerResultTtlInSeconds: cacheTTL,
      ...(functionArn && {
        AuthorizerUri: await getAuthorizerUri(functionArn)
      })
    })
  );
};

export const deleteAuthorizer = async (apiId: string, authorizerId: string) => {
  Logger.logDelete(AuthorizerServiceName, authorizerId);

  await client.send(
    new DeleteAuthorizerCommand({
      ApiId: apiId,
      AuthorizerId: authorizerId
    })
  );
};

const getIdentitySources = (request: Pick<CreateRequest, 'headerNames' | 'queryNames'>) => {
  const { headerNames, queryNames } = request;

  const identitySources = new Set<string>();

  if (headerNames) {
    headerNames.forEach((name) => identitySources.add(`$request.header.${name}`));
  }

  if (queryNames) {
    queryNames.forEach((name) => identitySources.add(`$request.querystring.${name}`));
  }

  if (identitySources.size > 0) {
    return [...identitySources.values()];
  }

  return ['$request.header.Authorization'];
};
