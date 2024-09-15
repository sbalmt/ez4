import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { DistributionConfig, Origins } from '@aws-sdk/client-cloudfront';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  CloudFrontClient,
  GetDistributionCommand,
  CreateDistributionWithTagsCommand,
  UpdateDistributionCommand,
  DeleteDistributionCommand,
  waitUntilDistributionDeployed,
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

export type DistributionOrigin = {
  id: string;
  domain: string;
  path?: string;
};

export type CreateRequest = {
  distributionName: string;
  description?: string;
  defaultOrigin: DistributionOrigin;
  defaultAccessId?: string;
  defaultPolicyId?: string;
  defaultIndex?: string;
  origins?: DistributionOrigin[];
  compress?: boolean;
  enabled: boolean;
  tags?: ResourceTags;
};

export type CreateResponse = {
  distributionId: string;
  distributionArn: Arn;
  endpoint: string;
};

export type UpdateRequest = CreateRequest;

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
    endpoint: distribution.DomainName!
  };
};

export const updateDistribution = async (distributionId: string, request: UpdateRequest) => {
  Logger.logUpdate(DistributionServiceName, distributionId);

  const version = await getCurrentDistributionVersion(distributionId);

  await client.send(
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

export const deleteDistribution = async (distributionId: string) => {
  Logger.logDelete(DistributionServiceName, distributionId);

  const version = await getCurrentDistributionVersion(distributionId);

  await client.send(
    new DeleteDistributionCommand({
      Id: distributionId,
      IfMatch: version
    })
  );
};

const getCurrentDistributionVersion = async (distributionId: string) => {
  const response = await client.send(
    new GetDistributionCommand({
      Id: distributionId
    })
  );

  return response.ETag!;
};

const upsertDistributionRequest = (request: CreateRequest | UpdateRequest): DistributionConfig => {
  const allOrigins = getAllOrigins(request);

  const defaultOrigin = allOrigins.Items![0];

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
      ...allOrigins
    },
    OriginGroups: {
      Quantity: 0
    },
    DefaultCacheBehavior: {
      TargetOriginId: defaultOrigin.Id,
      CachePolicyId: request.defaultPolicyId,
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

const getAllOrigins = (request: CreateRequest | UpdateRequest): Origins => {
  const { defaultOrigin, defaultAccessId, origins } = request;

  const originList = origins ? [defaultOrigin, ...origins] : [defaultOrigin];

  const allOrigins = originList.map(({ id, domain, path }) => {
    return {
      Id: id,
      DomainName: domain,
      OriginPath: path ?? '',
      OriginAccessControlId: defaultAccessId ?? '',
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

  return {
    Quantity: allOrigins.length,
    Items: allOrigins
  };
};
