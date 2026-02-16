import type { Arn, OperationLogLine, ResourceTags } from '@ez4/aws-common';

import {
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  NotFoundException,
  TagResourceCommand,
  UntagResourceCommand
} from '@aws-sdk/client-sesv2';

import { getAccountId, getRegion } from '@ez4/aws-identity';
import { getTagList } from '@ez4/aws-common';

import { getSESClient } from '../utils/deploy';
import { buildIdentityArn } from '../utils/arn';

export type CreateRequest = {
  identity: string;
  tags?: ResourceTags;
};

export type ImportOrCreateResponse = {
  identityArn: Arn;
};

export const importIdentity = async (logger: OperationLogLine, identity: string): Promise<ImportOrCreateResponse | undefined> => {
  logger.update(`Importing identity`);

  try {
    const [region, accountId] = await Promise.all([
      getRegion(),
      getAccountId(),
      getSESClient().send(
        new GetEmailIdentityCommand({
          EmailIdentity: identity
        })
      )
    ]);

    return {
      identityArn: buildIdentityArn(region, accountId, identity)
    };
  } catch (error) {
    if (!(error instanceof NotFoundException)) {
      throw error;
    }

    return undefined;
  }
};

export const createIdentity = async (logger: OperationLogLine, request: CreateRequest): Promise<ImportOrCreateResponse> => {
  logger.update(`Creating identity`);

  const { identity } = request;

  const [region, accountId] = await Promise.all([
    getRegion(),
    getAccountId(),
    getSESClient().send(
      new CreateEmailIdentityCommand({
        EmailIdentity: identity,
        DkimSigningAttributes: {
          NextSigningKeyLength: 'RSA_2048_BIT'
        },
        Tags: getTagList({
          ...request.tags,
          ManagedBy: 'EZ4'
        })
      })
    )
  ]);

  return {
    identityArn: buildIdentityArn(region, accountId, identity)
  };
};

export const tagIdentity = async (logger: OperationLogLine, identityArn: string, tags: ResourceTags) => {
  logger.update(`Tag identity`);

  await getSESClient().send(
    new TagResourceCommand({
      ResourceArn: identityArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagIdentity = async (logger: OperationLogLine, identityArn: string, tagKeys: string[]) => {
  logger.update(`Untag identity`);

  await getSESClient().send(
    new UntagResourceCommand({
      ResourceArn: identityArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteIdentity = async (logger: OperationLogLine, identity: string) => {
  logger.update(`Delete identity`);

  try {
    await getSESClient().send(
      new DeleteEmailIdentityCommand({
        EmailIdentity: identity
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
