import type { Arn, ResourceTags } from '@ez4/aws-common';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  ACMClient,
  DescribeCertificateCommand,
  RequestCertificateCommand,
  DeleteCertificateCommand,
  AddTagsToCertificateCommand,
  RemoveTagsFromCertificateCommand,
  ValidationMethod
} from '@aws-sdk/client-acm';

import { CertificateServiceName } from './types.js';

const client = new ACMClient({});

export type CreateRequest = {
  domainName: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  certificateArn: Arn;
};

export const isCertificateInUse = async (certificateArn: string) => {
  Logger.logFetch(CertificateServiceName, certificateArn);

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

  return {
    certificateArn
  };
};

export const deleteCertificate = async (certificateArn: string) => {
  Logger.logDelete(CertificateServiceName, certificateArn);

  await client.send(
    new DeleteCertificateCommand({
      CertificateArn: certificateArn
    })
  );
};

export const tagCertificate = async (certificateArn: string, tags: ResourceTags) => {
  Logger.logTag(CertificateServiceName, certificateArn);

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
  Logger.logTag(CertificateServiceName, certificateArn);

  await client.send(
    new RemoveTagsFromCertificateCommand({
      CertificateArn: certificateArn,
      Tags: tagKeys.map((tagKey) => ({
        Key: tagKey
      }))
    })
  );
};
