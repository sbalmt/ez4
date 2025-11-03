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

import { GatewayServiceName } from './types';

const client = new ApiGatewayV2Client({});

export type CreateRequest = {
  gatewayName: string;
  description?: string;
  cors?: Http.Cors;
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
  cors?: Http.Cors;
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
