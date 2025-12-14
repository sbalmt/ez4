import type { ProtocolType } from '@aws-sdk/client-apigatewayv2';
import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { Http } from '@ez4/gateway';

import {
  ApiGatewayV2Client,
  CreateApiCommand,
  UpdateApiCommand,
  DeleteApiCommand,
  DeleteCorsConfigurationCommand,
  TagResourceCommand,
  UntagResourceCommand,
  NotFoundException,
  GetApisCommand
} from '@aws-sdk/client-apigatewayv2';

import { Logger, tryParseArn } from '@ez4/aws-common';

import { GatewayProtocol, GatewayServiceName } from './types';

const client = new ApiGatewayV2Client({});

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

export const fetchGateway = async (gatewayName: string) => {
  Logger.logFetch(GatewayServiceName, gatewayName);

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

export const createGateway = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(GatewayServiceName, request.gatewayName);

  const { gatewayName, description, protocol, tags } = request;

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

export const updateGateway = async (apiId: string, request: UpdateRequest) => {
  Logger.logUpdate(GatewayServiceName, apiId);

  const { gatewayName, description, protocol } = request;

  await client.send(
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

export const deleteCorsConfiguration = async (apiId: string) => {
  Logger.logDelete(GatewayServiceName, `${apiId} CORS`);

  try {
    await client.send(
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

export const tagGateway = async (apiArn: Arn, tags: ResourceTags) => {
  const apiName = tryParseArn(apiArn)?.resourceName ?? apiArn;

  Logger.logTag(GatewayServiceName, apiName);

  await client.send(
    new TagResourceCommand({
      ResourceArn: apiArn,
      Tags: {
        ...tags,
        ManagedBy: 'EZ4'
      }
    })
  );
};

export const untagGateway = async (apiArn: Arn, tagKeys: string[]) => {
  const apiName = tryParseArn(apiArn)?.resourceName ?? apiArn;

  Logger.logUntag(GatewayServiceName, apiName);

  await client.send(
    new UntagResourceCommand({
      ResourceArn: apiArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteGateway = async (apiId: string) => {
  Logger.logDelete(GatewayServiceName, apiId);

  try {
    await client.send(
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
