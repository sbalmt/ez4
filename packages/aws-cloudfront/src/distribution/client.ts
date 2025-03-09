import type { Arn, ResourceTags } from '@ez4/aws-common';

import type {
  CacheBehavior,
  CustomErrorResponses,
  DefaultCacheBehavior,
  DistributionConfig,
  OriginCustomHeader,
  Origin
} from '@aws-sdk/client-cloudfront';

import { getTagList, Logger } from '@ez4/aws-common';
import { isBucketDomain } from '@ez4/aws-bucket';

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
  GeoRestrictionType,
  CertificateSource,
  MinimumProtocolVersion,
  OriginProtocolPolicy,
  SSLSupportMethod,
  SslProtocol,
  HttpVersion,
  PriceClass,
  Method
} from '@aws-sdk/client-cloudfront';

import { DistributionServiceName } from './types.js';

const client = new CloudFrontClient({});

const waiter = {
  minDelay: 30,
  maxWaitTime: 3600,
  maxDelay: 120,
  client
};

export type DefaultOrigin = {
  id: string;
  domain: string;
  cachePolicyId: string;
  originPolicyId?: string;
  headers?: Record<string, string>;
  location?: string;
  http?: boolean;
  port?: number;
};

export type AdditionalOrigin = DefaultOrigin & {
  path: string;
};

export type DistributionCustomError = {
  code: number;
  location: string;
  ttl: number;
};

export type CreateRequest = {
  distributionName: string;
  customErrors?: DistributionCustomError[];
  defaultIndex?: string;
  defaultOrigin: DefaultOrigin;
  origins?: AdditionalOrigin[];
  certificateArn?: Arn;
  originAccessId?: string;
  description?: string;
  compress?: boolean;
  aliases?: string[];
  enabled: boolean;
  tags?: ResourceTags;
};

export type CreateResponse = {
  distributionId: string;
  distributionArn: Arn;
  endpoint: string;
};

export type UpdateRequest = Omit<CreateRequest, 'tags'>;

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
  const allCustomErrors = getAllCustomErrors(request);
  const allCacheBehaviors = getAllCacheBehaviors(request);
  const allOrigins = getAllOrigins(request);

  const {
    distributionName,
    description,
    certificateArn,
    defaultIndex,
    defaultOrigin,
    aliases,
    enabled,
    compress
  } = request;

  return {
    Comment: description,
    CallerReference: distributionName,
    DefaultRootObject: defaultIndex ?? '',
    PriceClass: PriceClass.PriceClass_All,
    HttpVersion: HttpVersion.http2and3,
    ContinuousDeploymentPolicyId: '',
    Enabled: enabled,
    IsIPV6Enabled: true,
    Staging: false,
    WebACLId: '',
    Aliases: {
      Quantity: aliases?.length ?? 0,
      Items: aliases
    },
    Origins: {
      Quantity: allOrigins.length,
      Items: allOrigins
    },
    OriginGroups: {
      Quantity: 0
    },
    DefaultCacheBehavior: {
      ...getCacheBehavior(defaultOrigin, compress)
    },
    CacheBehaviors: {
      Quantity: allCacheBehaviors?.length ?? 0,
      ...(allCacheBehaviors?.length && {
        Items: allCacheBehaviors
      })
    },
    CustomErrorResponses: {
      ...allCustomErrors
    },
    Logging: {
      Enabled: false,
      IncludeCookies: false,
      Bucket: '',
      Prefix: ''
    },
    ViewerCertificate: {
      SSLSupportMethod: SSLSupportMethod.sni_only,
      MinimumProtocolVersion: MinimumProtocolVersion.TLSv1,
      ...(certificateArn
        ? {
            CloudFrontDefaultCertificate: false,
            CertificateSource: CertificateSource.acm,
            ACMCertificateArn: certificateArn
          }
        : {
            CloudFrontDefaultCertificate: true,
            CertificateSource: CertificateSource.cloudfront
          })
    },
    Restrictions: {
      GeoRestriction: {
        RestrictionType: GeoRestrictionType.none,
        Quantity: 0
      }
    }
  };
};

const getOriginHeaders = (headers: Record<string, string> | undefined): OriginCustomHeader[] => {
  const headerList = [];

  for (const name in headers) {
    headerList.push({
      HeaderName: name,
      HeaderValue: headers[name]
    });
  }

  return headerList;
};

const getCacheBehavior = (
  origin: DefaultOrigin,
  compress: boolean | undefined
): DefaultCacheBehavior => {
  return {
    TargetOriginId: origin.id,
    CachePolicyId: origin.cachePolicyId,
    OriginRequestPolicyId: origin.originPolicyId,
    ViewerProtocolPolicy: ViewerProtocolPolicy.redirect_to_https,
    FieldLevelEncryptionId: '',
    SmoothStreaming: false,
    Compress: !!compress,
    TrustedSigners: {
      Enabled: false,
      Quantity: 0
    },
    TrustedKeyGroups: {
      Enabled: false,
      Quantity: 0
    },
    AllowedMethods: {
      CachedMethods: {
        Quantity: 3,
        Items: [Method.GET, Method.HEAD, Method.OPTIONS]
      },
      Quantity: 7,
      Items: [
        Method.GET,
        Method.HEAD,
        Method.OPTIONS,
        Method.POST,
        Method.PUT,
        Method.PATCH,
        Method.DELETE
      ]
    },
    LambdaFunctionAssociations: {
      Quantity: 0
    },
    FunctionAssociations: {
      Quantity: 0
    }
  };
};

const getAllOrigins = (request: CreateRequest | UpdateRequest): Origin[] => {
  const { defaultOrigin, originAccessId, origins } = request;

  const originList = origins ? [defaultOrigin, ...origins] : [defaultOrigin];

  return originList.map(({ id, domain, location, headers, port, http }) => {
    const isBucket = isBucketDomain(domain);

    const originProtocol = http ? OriginProtocolPolicy.http_only : OriginProtocolPolicy.https_only;
    const originHeaders = getOriginHeaders(headers);

    return {
      Id: id,
      DomainName: domain,
      OriginPath: location ?? '',
      ConnectionAttempts: 3,
      ConnectionTimeout: 10,
      CustomHeaders: {
        Quantity: originHeaders?.length ?? 0,
        ...(originHeaders.length && {
          Items: originHeaders
        })
      },
      ...(isBucket
        ? {
            OriginAccessControlId: originAccessId ?? '',
            S3OriginConfig: {
              OriginAccessIdentity: ''
            }
          }
        : {
            CustomOriginConfig: {
              HTTPPort: port ?? 80,
              HTTPSPort: port ?? 443,
              OriginProtocolPolicy: originProtocol,
              OriginKeepaliveTimeout: 5,
              OriginReadTimeout: 30,
              OriginSslProtocols: {
                Quantity: 1,
                Items: [SslProtocol.SSLv3]
              }
            }
          }),
      OriginShield: {
        Enabled: false
      }
    };
  });
};

const getAllCacheBehaviors = (
  request: CreateRequest | UpdateRequest
): CacheBehavior[] | undefined => {
  const { origins, compress } = request;

  return origins?.map((origin) => ({
    ...getCacheBehavior(origin, compress),
    PathPattern: origin.path
  }));
};

const getAllCustomErrors = (request: CreateRequest | UpdateRequest): CustomErrorResponses => {
  const { customErrors } = request;

  if (!customErrors?.length) {
    return {
      Quantity: 0
    };
  }

  const allCustomErrors = customErrors.map(({ code, location, ttl }) => {
    return {
      ErrorCode: code,
      ErrorCachingMinTTL: ttl,
      ResponsePagePath: location,
      ResponseCode: '200'
    };
  });

  return {
    Quantity: allCustomErrors.length,
    Items: allCustomErrors
  };
};
