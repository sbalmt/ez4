import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { DistributionConfig, Origin } from '@aws-sdk/client-cloudfront';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  CloudFrontClient,
  waitUntilDistributionDeployed,
  CreateDistributionWithTagsCommand,
  UpdateDistributionCommand,
  DeleteDistributionCommand,
  TagResourceCommand,
  UntagResourceCommand,
  ViewerProtocolPolicy,
  MinimumProtocolVersion,
  CertificateSource,
  SSLSupportMethod,
  GeoRestrictionType,
  HttpVersion,
  PriceClass,
  Method
} from '@aws-sdk/client-cloudfront';

import { DistributionServiceName } from './types.js';

const client = new CloudFrontClient({});

const waiter = {
  minDelay: 30,
  maxWaitTime: 3600,
  maxDelay: 60,
  client
};

export type OriginRequest = {
  id: string;
  domainName: string;
  originPath?: string;
};

export type CreateRequest = {
  distributionName: string;
  description?: string;
  defaultIndex?: string;
  origins: OriginRequest[];
  compress?: boolean;
  enabled: boolean;
  tags?: ResourceTags;
};

export type CreateResponse = {
  distributionId: string;
  distributionArn: Arn;
  endpoint: string;
  version: string;
};

export type UpdateRequest = Partial<CreateRequest>;

export type UpdateResponse = CreateResponse;

export const createDistribution = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(DistributionServiceName, request.distributionName);

  const response = await client.send(
    new CreateDistributionWithTagsCommand({
      DistributionConfigWithTags: {
        DistributionConfig: {
          ...upsertDistributionRequest(request)
        },
        Tags: {
          Items: getTagList({
            ...request.tags,
            ManagedBy: 'EZ4'
          })
        }
      }
    })
  );

  const distribution = response.Distribution!;

  const distributionId = distribution.Id!;

  await waitUntilDistributionDeployed(waiter, {
    Id: distributionId
  });

  return {
    distributionId,
    distributionArn: distribution.ARN as Arn,
    endpoint: distribution.DomainName!,
    version: response.ETag!
  };
};

export const updateDistribution = async (
  distributionId: string,
  version: string,
  request: UpdateRequest
): Promise<UpdateResponse> => {
  Logger.logUpdate(DistributionServiceName, distributionId);

  const response = await client.send(
    new UpdateDistributionCommand({
      Id: distributionId,
      IfMatch: version,
      DistributionConfig: {
        ...upsertDistributionRequest(request)
      }
    })
  );

  await waitUntilDistributionDeployed(waiter, {
    Id: distributionId
  });

  const distribution = response.Distribution!;

  return {
    distributionId,
    distributionArn: distribution.ARN as Arn,
    endpoint: distribution.DomainName!,
    version: response.ETag!
  };
};

export const tagDistribution = async (distributionArn: string, tags: ResourceTags) => {
  Logger.logTag(DistributionServiceName, distributionArn);

  await client.send(
    new TagResourceCommand({
      Resource: distributionArn,
      Tags: {
        Items: getTagList({
          ...tags,
          ManagedBy: 'EZ4'
        })
      }
    })
  );
};

export const untagDistribution = async (distributionArn: Arn, tagKeys: string[]) => {
  Logger.logUntag(DistributionServiceName, distributionArn);

  await client.send(
    new UntagResourceCommand({
      Resource: distributionArn,
      TagKeys: {
        Items: tagKeys
      }
    })
  );
};

export const deleteDistribution = async (distributionId: string, version: string) => {
  Logger.logDelete(DistributionServiceName, distributionId);

  await client.send(
    new DeleteDistributionCommand({
      Id: distributionId,
      IfMatch: version
    })
  );
};

const upsertDistributionRequest = (request: CreateRequest | UpdateRequest): DistributionConfig => {
  const originList = getOriginList(request.origins ?? []);

  const defaultCacheMethods = {
    Quantity: 2,
    Items: [Method.GET, Method.HEAD]
  };

  return {
    Comment: request.description,
    CallerReference: request.distributionName,
    DefaultRootObject: request.defaultIndex ?? '',
    PriceClass: PriceClass.PriceClass_All,
    HttpVersion: HttpVersion.http2and3,
    ContinuousDeploymentPolicyId: '',
    Enabled: request.enabled,
    IsIPV6Enabled: true,
    Staging: false,
    WebACLId: '',
    Aliases: {
      Quantity: 0
    },
    Origins: {
      Quantity: originList.length,
      Items: originList
    },
    OriginGroups: {
      Quantity: 0
    },
    DefaultCacheBehavior: {
      TargetOriginId: originList[0].Id,
      CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
      ViewerProtocolPolicy: ViewerProtocolPolicy.redirect_to_https,
      Compress: !!request.compress,
      FieldLevelEncryptionId: '',
      SmoothStreaming: false,
      TrustedSigners: {
        Enabled: false,
        Quantity: 0
      },
      TrustedKeyGroups: {
        Enabled: false,
        Quantity: 0
      },
      AllowedMethods: {
        ...defaultCacheMethods,
        CachedMethods: {
          ...defaultCacheMethods
        }
      },
      LambdaFunctionAssociations: {
        Quantity: 0
      },
      FunctionAssociations: {
        Quantity: 0
      }
    },
    CacheBehaviors: {
      Quantity: 0
    },
    CustomErrorResponses: {
      Quantity: 0
    },
    Logging: {
      Enabled: false,
      IncludeCookies: false,
      Bucket: '',
      Prefix: ''
    },
    ViewerCertificate: {
      CloudFrontDefaultCertificate: true,
      SSLSupportMethod: SSLSupportMethod.vip,
      MinimumProtocolVersion: MinimumProtocolVersion.SSLv3,
      CertificateSource: CertificateSource.cloudfront
    },
    Restrictions: {
      GeoRestriction: {
        RestrictionType: GeoRestrictionType.none,
        Quantity: 0
      }
    }
  };
};

const getOriginList = (origins: OriginRequest[]): Origin[] => {
  return origins.map(({ id, domainName, originPath }) => {
    return {
      Id: id,
      DomainName: domainName,
      OriginPath: originPath ?? '',
      OriginAccessControlId: '',
      ConnectionAttempts: 3,
      ConnectionTimeout: 10,
      CustomHeaders: {
        Quantity: 0
      },
      S3OriginConfig: {
        OriginAccessIdentity: ''
      },
      OriginShield: {
        Enabled: false
      }
    };
  });
};
