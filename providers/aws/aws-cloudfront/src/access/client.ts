import type { OriginAccessControlConfig } from '@aws-sdk/client-cloudfront';

import { Logger } from '@ez4/aws-common';

import {
  CloudFrontClient,
  GetOriginAccessControlCommand,
  CreateOriginAccessControlCommand,
  UpdateOriginAccessControlCommand,
  DeleteOriginAccessControlCommand,
  OriginAccessControlOriginTypes,
  OriginAccessControlSigningBehaviors,
  OriginAccessControlSigningProtocols,
  NoSuchOriginAccessControl
} from '@aws-sdk/client-cloudfront';

import { AccessServiceName } from './types';

const client = new CloudFrontClient({});

export type CreateRequest = {
  accessName: string;
  description?: string;
};

export type CreateResponse = {
  accessId: string;
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

  const accessId = response.OriginAccessControl?.Id!;

  return {
    accessId
  };
};

export const updateAccess = async (accessId: string, request: UpdateRequest) => {
  Logger.logUpdate(AccessServiceName, request.accessName);

  const version = await getCurrentAccessVersion(accessId);

  await client.send(
    new UpdateOriginAccessControlCommand({
      Id: accessId,
      IfMatch: version,
      OriginAccessControlConfig: {
        ...upsertAccessRequest(request)
      }
    })
  );
};

export const deleteAccess = async (accessId: string) => {
  Logger.logDelete(AccessServiceName, accessId);

  const version = await getCurrentAccessVersion(accessId);

  try {
    await client.send(
      new DeleteOriginAccessControlCommand({
        Id: accessId,
        IfMatch: version
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof NoSuchOriginAccessControl)) {
      throw error;
    }

    return false;
  }
};

const getCurrentAccessVersion = async (accessId: string) => {
  const response = await client.send(
    new GetOriginAccessControlCommand({
      Id: accessId
    })
  );

  return response.ETag!;
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
