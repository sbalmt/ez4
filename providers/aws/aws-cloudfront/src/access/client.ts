import type { OriginAccessControlConfig } from '@aws-sdk/client-cloudfront';
import type { Logger } from '@ez4/aws-common';

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

export const createOriginAccess = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating origin access`);

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

export const updateOriginAccess = async (logger: Logger.OperationLogger, accessId: string, request: UpdateRequest) => {
  logger.update(`Updating origin access`);

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

export const deleteOriginAccess = async (logger: Logger.OperationLogger, accessId: string) => {
  logger.update(`Deleting origin access`);

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
