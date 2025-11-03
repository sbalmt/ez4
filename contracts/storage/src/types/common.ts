import type { LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';

export type BucketCors = {
  allowOrigins: string[];
  allowMethods?: string[];
  exposeHeaders?: string[];
  allowHeaders?: string[];
  maxAge?: number;
};

export type EventHandler = {
  file: string;
  module?: string;
  name: string;
  description?: string;
};

export type BucketEvent = {
  path?: string;
  listener?: ServiceListener;
  handler: EventHandler;
  variables?: LinkedVariables;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};
