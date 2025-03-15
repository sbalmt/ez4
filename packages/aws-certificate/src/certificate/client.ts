import type { Arn, ResourceTags } from '@ez4/aws-common';

import { getTagList, Logger, tryParseArn } from '@ez4/aws-common';

import {
  ACMClient,
  DescribeCertificateCommand,
  RequestCertificateCommand,
  DeleteCertificateCommand,
  AddTagsToCertificateCommand,
  RemoveTagsFromCertificateCommand,
  ValidationMethod,
  ResourceNotFoundException,
  waitUntilCertificateValidated
} from '@aws-sdk/client-acm';

import { CertificateServiceName } from './types.js';

const client = new ACMClient({});

const waiter = {
  minDelay: 15,
  maxWaitTime: 1800,
  maxDelay: 60,
  client
};

export type CreateRequest = {
  domainName: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  certificateArn: Arn;
};

export const isCertificateInUse = async (certificateArn: string) => {
  const certificateName = tryParseArn(certificateArn)?.resourceName ?? certificateArn;

  Logger.logFetch(CertificateServiceName, certificateName);

  const response = await client.send(
    new DescribeCertificateCommand({
      CertificateArn: certificateArn
    })
  );

  return !!response.Certificate?.InUseBy?.length;
};

export const createCertificate = async (request: CreateRequest): Promise<CreateResponse> => {
  const { domainName } = request;

  Logger.logCreate(CertificateServiceName, domainName);

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

  Logger.logWait(CertificateServiceName, domainName);

  await waitUntilCertificateValidated(waiter, {
    CertificateArn: certificateArn
  });

  return {
    certificateArn
  };
};

export const deleteCertificate = async (certificateArn: string) => {
  const certificateName = tryParseArn(certificateArn)?.resourceName ?? certificateArn;

  Logger.logDelete(CertificateServiceName, certificateName);

  try {
    await client.send(
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

export const tagCertificate = async (certificateArn: string, tags: ResourceTags) => {
  const certificateName = tryParseArn(certificateArn)?.resourceName ?? certificateArn;

  Logger.logTag(CertificateServiceName, certificateName);

  await client.send(
    new AddTagsToCertificateCommand({
      CertificateArn: certificateArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagCertificate = async (certificateArn: string, tagKeys: string[]) => {
  const certificateName = tryParseArn(certificateArn)?.resourceName ?? certificateArn;

  Logger.logTag(CertificateServiceName, certificateName);

  await client.send(
    new RemoveTagsFromCertificateCommand({
      CertificateArn: certificateArn,
      Tags: tagKeys.map((tagKey) => ({
        Key: tagKey
      }))
    })
  );
};
