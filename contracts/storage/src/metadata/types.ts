import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { LinkedVariables, ServiceMetadata } from '@ez4/project/library';
import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/bucket';

export type BucketService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    name: string;
    localPath?: string;
    globalName?: string;
    autoExpireDays?: number;
    events?: BucketEvent;
    cors?: BucketCors;
  };

export type BucketCors = {
  allowOrigins: string[];
  allowMethods?: string[];
  exposeHeaders?: string[];
  allowHeaders?: string[];
  maxAge?: number;
};

export type EventHandler = FunctionSignature;

export type BucketEvent = {
  path?: string;
  listener?: ServiceListener;
  handler: EventHandler;
  variables?: LinkedVariables;
  architecture?: ArchitectureType;
  runtime?: RuntimeType;
  logRetention?: number;
  logLevel?: LogLevel;
  timeout?: number;
  memory?: number;
  files?: string[];
  vpc?: boolean;
};

export const isBucketService = (service: ServiceMetadata): service is BucketService => {
  return service.type === ServiceType;
};

export const createBucketService = (name: string) => {
  return {
    ...createServiceMetadata<BucketService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
