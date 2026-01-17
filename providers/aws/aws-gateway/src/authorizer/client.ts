import type { Arn, Logger } from '@ez4/aws-common';

import {
  ApiGatewayV2Client,
  CreateAuthorizerCommand,
  UpdateAuthorizerCommand,
  DeleteAuthorizerCommand,
  AuthorizerType,
  NotFoundException
} from '@aws-sdk/client-apigatewayv2';

import { waitUpdates } from '@ez4/aws-common';

import { getAuthorizerUri } from './utils';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  name: string;
  functionArn: Arn;
  headerNames?: string[];
  queryNames?: string[];
  cacheTTL?: number;
  http: boolean;
};

export type CreateResponse = {
  authorizerId: string;
};

export type UpdateRequest = Omit<CreateRequest, 'functionArn'> & Partial<Pick<CreateRequest, 'functionArn'>>;

export const createAuthorizer = async (logger: Logger.OperationLogger, apiId: string, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating authorizer`);

  const { name, http, functionArn, headerNames, queryNames, cacheTTL } = request;

  const response = await client.send(
    new CreateAuthorizerCommand({
      Name: name,
      ApiId: apiId,
      AuthorizerUri: await getAuthorizerUri(functionArn),
      AuthorizerPayloadFormatVersion: http ? '2.0' : undefined,
      AuthorizerType: AuthorizerType.REQUEST,
      AuthorizerResultTtlInSeconds: cacheTTL,
      ...(http && {
        EnableSimpleResponses: false
      }),
      IdentitySource: getIdentitySources({
        headerNames,
        queryNames,
        http
      })
    })
  );

  return {
    authorizerId: response.AuthorizerId!
  };
};

export const updateAuthorizer = async (logger: Logger.OperationLogger, apiId: string, authorizerId: string, request: UpdateRequest) => {
  logger.update(`Updating authorizer`);

  const { name, http, functionArn, headerNames, queryNames, cacheTTL } = request;

  await waitUpdates(async () => {
    return client.send(
      new UpdateAuthorizerCommand({
        Name: name,
        ApiId: apiId,
        AuthorizerId: authorizerId,
        AuthorizerResultTtlInSeconds: cacheTTL,
        ...(functionArn && {
          AuthorizerUri: await getAuthorizerUri(functionArn)
        }),
        ...(http && {
          EnableSimpleResponses: false
        }),
        IdentitySource: getIdentitySources({
          headerNames,
          queryNames,
          http
        })
      })
    );
  });
};

export const deleteAuthorizer = async (logger: Logger.OperationLogger, apiId: string, authorizerId: string) => {
  logger.update(`Deleting authorizer`);

  try {
    await client.send(
      new DeleteAuthorizerCommand({
        ApiId: apiId,
        AuthorizerId: authorizerId
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NotFoundException)) {
      throw error;
    }

    return false;
  }
};

const getIdentitySources = (request: Pick<CreateRequest, 'headerNames' | 'queryNames' | 'http'>) => {
  const { headerNames, queryNames, http } = request;

  const identitySources = new Set<string>();

  if (headerNames) {
    headerNames.forEach((name) => identitySources.add(getHeaderPath(name, http)));
  }

  if (queryNames) {
    queryNames.forEach((name) => identitySources.add(getQueryPath(name, http)));
  }

  if (identitySources.size > 0) {
    return [...identitySources.values()];
  }

  return [getHeaderPath('Authorization', http)];
};

const getQueryPath = (name: string, http: boolean) => {
  return http ? `$request.querystring.${name}` : `route.request.querystring.${name}`;
};

const getHeaderPath = (name: string, http: boolean) => {
  return http ? `$request.header.${name}` : `header.${name}`;
};
