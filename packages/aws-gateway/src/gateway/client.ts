import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  ApiGatewayV2Client,
  CreateApiCommand,
  UpdateApiCommand,
  DeleteApiCommand,
  TagResourceCommand,
  UntagResourceCommand,
  DeleteCorsConfigurationCommand
} from '@aws-sdk/client-apigatewayv2';

import { Logger } from '@ez4/aws-common';

import { GatewayServiceName } from './types.js';

const client = new ApiGatewayV2Client({});

export type CorsConfiguration = {
  allowOrigins: string[];
  allowMethods?: string[];
  allowCredentials?: boolean;
  exposeHeaders?: string[];
  allowHeaders?: string[];
  maxAge?: number;
};

export type CreateRequest = {
  gatewayName: string;
  description?: string;
  cors?: CorsConfiguration;
  tags?: ResourceTags;
};

export type CreateResponse = {
  apiId: string;
  apiArn: Arn;
  endpoint?: string;
};

export type UpdateRequest = {
  gatewayName?: string;
  description?: string;
  cors?: CorsConfiguration;
};

export const createGateway = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(GatewayServiceName, request.gatewayName);

  const { gatewayName, description, cors, tags } = request;

  const [region, response] = await Promise.all([
    client.config.region(),
    client.send(
      new CreateApiCommand({
        Name: gatewayName,
        Description: description,
        ProtocolType: 'HTTP',
        ...(cors && {
          CorsConfiguration: {
            AllowOrigins: cors.allowOrigins,
            AllowMethods: cors.allowMethods,
            AllowCredentials: cors.allowCredentials,
            ExposeHeaders: cors.exposeHeaders,
            AllowHeaders: cors.allowHeaders,
            MaxAge: cors.maxAge
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

  const { gatewayName, description, cors } = request;

  await client.send(
    new UpdateApiCommand({
      ApiId: apiId,
      Name: gatewayName,
      Description: description,
      ...(cors && {
        CorsConfiguration: {
          AllowOrigins: cors.allowOrigins,
          AllowMethods: cors.allowMethods,
          AllowCredentials: cors.allowCredentials,
          ExposeHeaders: cors.exposeHeaders,
          AllowHeaders: cors.allowHeaders,
          MaxAge: cors.maxAge
        }
      })
    })
  );
};

export const deleteCorsConfiguration = async (apiId: string) => {
  Logger.logUpdate(GatewayServiceName, `${apiId} CORS`);

  await client.send(
    new DeleteCorsConfigurationCommand({
      ApiId: apiId
    })
  );
};

export const tagGateway = async (apiArn: Arn, tags: ResourceTags) => {
  Logger.logTag(GatewayServiceName, apiArn);

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
  Logger.logUntag(GatewayServiceName, apiArn);

  await client.send(
    new UntagResourceCommand({
      ResourceArn: apiArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteGateway = async (apiId: string) => {
  Logger.logDelete(GatewayServiceName, apiId);

  await client.send(
    new DeleteApiCommand({
      ApiId: apiId
    })
  );
};
