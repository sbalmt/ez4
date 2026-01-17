import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';

import { getTagList } from '@ez4/aws-common';

import {
  DescribeCertificateCommand,
  RequestCertificateCommand,
  DeleteCertificateCommand,
  AddTagsToCertificateCommand,
  RemoveTagsFromCertificateCommand,
  ResourceNotFoundException,
  waitUntilCertificateValidated,
  ValidationMethod
} from '@aws-sdk/client-acm';

import { getACMClient, getACMWaiter } from '../utils/deploy';

export type CreateRequest = {
  domainName: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  certificateArn: Arn;
};

export const isCertificateInUse = async (logger: Logger.OperationLogger, certificateArn: string) => {
  logger.update(`Fetching  certificate`);

  const response = await getACMClient().send(
    new DescribeCertificateCommand({
      CertificateArn: certificateArn
    })
  );

  return !!response.Certificate?.InUseBy?.length;
};

export const createCertificate = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating certificate`);

  const { domainName } = request;

  const client = getACMClient();

  const response = await client.send(
    new RequestCertificateCommand({
      DomainName: domainName,
      ValidationMethod: ValidationMethod.DNS,
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const certificateArn = response.CertificateArn as Arn;

  await waitUntilCertificateValidated(getACMWaiter(client), {
    CertificateArn: certificateArn
  });

  return {
    certificateArn
  };
};

export const deleteCertificate = async (certificateArn: string, logger: Logger.OperationLogger) => {
  logger.update(`Deleting certificate`);

  try {
    await getACMClient().send(
      new DeleteCertificateCommand({
        CertificateArn: certificateArn
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }

    return false;
  }
};

export const tagCertificate = async (logger: Logger.OperationLogger, certificateArn: string, tags: ResourceTags) => {
  logger.update(`Tag certificate`);

  await getACMClient().send(
    new AddTagsToCertificateCommand({
      CertificateArn: certificateArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagCertificate = async (logger: Logger.OperationLogger, certificateArn: string, tagKeys: string[]) => {
  logger.update(`Untag certificate`);

  await getACMClient().send(
    new RemoveTagsFromCertificateCommand({
      CertificateArn: certificateArn,
      Tags: tagKeys.map((tagKey) => ({
        Key: tagKey
      }))
    })
  );
};
