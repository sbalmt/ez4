import type { ProtocolType } from '@aws-sdk/client-apigatewayv2';
import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';
import type { Http } from '@ez4/gateway';

import {
  CreateApiCommand,
  UpdateApiCommand,
  DeleteApiCommand,
  DeleteCorsConfigurationCommand,
  TagResourceCommand,
  UntagResourceCommand,
  NotFoundException,
  GetApisCommand
} from '@aws-sdk/client-apigatewayv2';

import { GatewayProtocol } from './types';
import { getApiGatewayV2Client } from '../utils/deploy';

const PROTOCOL_MAP: Record<GatewayProtocol, ProtocolType> = {
  [GatewayProtocol.WebSocket]: 'WEBSOCKET',
  [GatewayProtocol.Http]: 'HTTP'
};

export type UpdateRequest = Partial<CreateRequest>;

export type CreateRequest = (CreateHttpOptions | CreateWebSocketOptions) & {
  description?: string;
  gatewayName: string;
  tags?: ResourceTags;
};

export type CreateHttpOptions = {
  protocol: GatewayProtocol.Http;
  cors?: Http.Cors;
};

export type CreateWebSocketOptions = {
  protocol: GatewayProtocol.WebSocket;
  routeKey: string;
};

export type CreateResponse = {
  apiId: string;
  apiArn: Arn;
  endpoint?: string;
};

export const fetchGateway = async (logger: Logger.OperationLogger, gatewayName: string) => {
  logger.update(`Fetching gateway`);

  const client = getApiGatewayV2Client();

  const [region, { Items }] = await Promise.all([client.config.region(), client.send(new GetApisCommand({}))]);

  const response = Items?.find(({ Name }) => Name === gatewayName);

  if (!response) {
    throw new Error(`API resource '${gatewayName}' wasn't found.`);
  }

  return {
    apiId: response.ApiId!,
    apiArn: `arn:aws:apigateway:${region}::/apis/${response.ApiId!}` as Arn,
    endpoint: response.ApiEndpoint!
  };
};

export const createGateway = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating gateway`);

  const { gatewayName, description, protocol, tags } = request;

  const client = getApiGatewayV2Client();

  const [region, response] = await Promise.all([
    client.config.region(),
    client.send(
      new CreateApiCommand({
        Name: gatewayName,
        Description: description,
        ProtocolType: PROTOCOL_MAP[protocol],
        ...(protocol === GatewayProtocol.WebSocket
          ? {
              RouteSelectionExpression: `$request.body.${request.routeKey}`
            }
          : request.cors && {
              CorsConfiguration: {
                AllowOrigins: request.cors.allowOrigins,
                AllowMethods: request.cors.allowMethods,
                AllowCredentials: request.cors.allowCredentials,
                ExposeHeaders: request.cors.exposeHeaders,
                AllowHeaders: request.cors.allowHeaders,
                MaxAge: request.cors.maxAge
              }
            }),
        Tags: {
          ...tags,
          ManagedBy: 'EZ4'
        }
      })
    )
  ]);

  return {
    apiId: response.ApiId!,
    apiArn: `arn:aws:apigateway:${region}::/apis/${response.ApiId!}` as Arn,
    endpoint: response.ApiEndpoint!
  };
};

export const updateGateway = async (logger: Logger.OperationLogger, apiId: string, request: UpdateRequest) => {
  logger.update(`Updating gateway`);

  const { gatewayName, description, protocol } = request;

  await getApiGatewayV2Client().send(
    new UpdateApiCommand({
      ApiId: apiId,
      Name: gatewayName,
      Description: description,
      ...(protocol === GatewayProtocol.WebSocket &&
        request.routeKey && {
          RouteSelectionExpression: `$request.body.${request.routeKey}`
        }),
      ...(protocol === GatewayProtocol.Http &&
        request.cors && {
          CorsConfiguration: {
            AllowOrigins: request.cors.allowOrigins,
            AllowMethods: request.cors.allowMethods,
            AllowCredentials: request.cors.allowCredentials,
            ExposeHeaders: request.cors.exposeHeaders,
            AllowHeaders: request.cors.allowHeaders,
            MaxAge: request.cors.maxAge
          }
        })
    })
  );
};

export const deleteCorsConfiguration = async (logger: Logger.OperationLogger, apiId: string) => {
  logger.update(`Deleting gateway CORS`);

  try {
    await getApiGatewayV2Client().send(
      new DeleteCorsConfigurationCommand({
        ApiId: apiId
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

export const tagGateway = async (logger: Logger.OperationLogger, apiArn: Arn, tags: ResourceTags) => {
  logger.update(`Tag gateway`);

  await getApiGatewayV2Client().send(
    new TagResourceCommand({
      ResourceArn: apiArn,
      Tags: {
        ...tags,
        ManagedBy: 'EZ4'
      }
    })
  );
};

export const untagGateway = async (logger: Logger.OperationLogger, apiArn: Arn, tagKeys: string[]) => {
  logger.update(`Untag gateway`);

  await getApiGatewayV2Client().send(
    new UntagResourceCommand({
      ResourceArn: apiArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteGateway = async (logger: Logger.OperationLogger, apiId: string) => {
  logger.update(`Deleting gateway`);

  try {
    await getApiGatewayV2Client().send(
      new DeleteApiCommand({
        ApiId: apiId
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
