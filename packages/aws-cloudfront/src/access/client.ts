import type { OriginAccessControlConfig } from '@aws-sdk/client-cloudfront';

import { Logger } from '@ez4/aws-common';

import {
  CloudFrontClient,
  CreateOriginAccessControlCommand,
  OriginAccessControlOriginTypes,
  OriginAccessControlSigningBehaviors,
  OriginAccessControlSigningProtocols,
  DeleteOriginAccessControlCommand,
  UpdateOriginAccessControlCommand
} from '@aws-sdk/client-cloudfront';

import { AccessServiceName } from './types.js';

const client = new CloudFrontClient({});

export type CreateRequest = {
  accessName: string;
  description?: string;
};

export type CreateResponse = {
  accessId: string;
  version: string;
};

export type UpdateRequest = CreateRequest;

export type UpdateResponse = CreateResponse;

export const createOriginAccess = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(AccessServiceName, request.accessName);

  const response = await client.send(
    new CreateOriginAccessControlCommand({
      OriginAccessControlConfig: {
        ...upsertAccessRequest(request)
      }
    })
  );

  return {
    accessId: response.OriginAccessControl?.Id!,
    version: response.ETag!
  };
};

export const updateAccess = async (
  accessId: string,
  version: string,
  request: UpdateRequest
): Promise<UpdateResponse> => {
  Logger.logUpdate(AccessServiceName, request.accessName);

  const response = await client.send(
    new UpdateOriginAccessControlCommand({
      Id: accessId,
      IfMatch: version,
      OriginAccessControlConfig: {
        ...upsertAccessRequest(request)
      }
    })
  );

  return {
    accessId: response.OriginAccessControl?.Id!,
    version: response.ETag!
  };
};

export const deleteAccess = async (accessId: string, version: string) => {
  Logger.logDelete(AccessServiceName, accessId);

  await client.send(
    new DeleteOriginAccessControlCommand({
      Id: accessId,
      IfMatch: version
    })
  );
};

const upsertAccessRequest = (request: CreateRequest | UpdateRequest): OriginAccessControlConfig => {
  const { accessName, description } = request;

  return {
    Name: accessName,
    Description: description,
    OriginAccessControlOriginType: OriginAccessControlOriginTypes.s3,
    SigningBehavior: OriginAccessControlSigningBehaviors.always,
    SigningProtocol: OriginAccessControlSigningProtocols.sigv4
  };
};
