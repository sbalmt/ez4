import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { LinkedVariables } from '@ez4/project/library';

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
  logRetention?: number;
  timeout?: number;
  memory?: number;
};
