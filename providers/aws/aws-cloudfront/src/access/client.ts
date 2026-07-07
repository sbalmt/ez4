import type { OriginAccessControlConfig } from '@aws-sdk/client-cloudfront';
import type { OperationLogLine } from '@ez4/aws-common';

import {
  GetOriginAccessControlCommand,
  CreateOriginAccessControlCommand,
  UpdateOriginAccessControlCommand,
  DeleteOriginAccessControlCommand,
  ListOriginAccessControlsCommand,
  OriginAccessControlOriginTypes,
  OriginAccessControlSigningProtocols,
  OriginAccessControlSigningBehaviors,
  NoSuchOriginAccessControl
} from '@aws-sdk/client-cloudfront';

import { getCloudFrontClient } from '../utils/deploy';

export type CreateRequest = {
  accessName: string;
  description?: string;
};

export type ImportOrCreateResponse = {
  accessId: string;
};

export type UpdateRequest = CreateRequest;

export type UpdateResponse = ImportOrCreateResponse;

export const importOriginAccess = async (logger: OperationLogLine, accessName: string): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing origin access`);

  const response = await getCloudFrontClient().send(
    new ListOriginAccessControlsCommand({
      MaxItems: 25
    })
  );

  const originAccess = response?.OriginAccessControlList?.Items?.find(({ Name }) => {
    return Name === accessName;
  });

  if (!originAccess) {
    return undefined;
  }

  return {
    accessId: originAccess.Id!
  };
};

export const createOriginAccess = async (logger: OperationLogLine, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating origin access`);

  const response = await getCloudFrontClient().send(
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

export const updateOriginAccess = async (logger: OperationLogLine, accessId: string, request: UpdateRequest) => {
  logger.update(`Updating origin access`);

  const version = await getCurrentAccessVersion(accessId);

  await getCloudFrontClient().send(
    new UpdateOriginAccessControlCommand({
      Id: accessId,
      IfMatch: version,
      OriginAccessControlConfig: {
        ...upsertAccessRequest(request)
      }
    })
  );
};

export const deleteOriginAccess = async (logger: OperationLogLine, accessId: string) => {
  logger.update(`Deleting origin access`);

  const version = await getCurrentAccessVersion(accessId);

  try {
    await getCloudFrontClient().send(
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
  const response = await getCloudFrontClient().send(
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
