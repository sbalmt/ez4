import type { LinkedVariables } from '@ez4/project/library';

export type BucketCors = {
  allowOrigins: string[];
  allowMethods?: string[];
  exposeHeaders?: string[];
  allowHeaders?: string[];
  maxAge?: number;
};

export type EventHandler = {
  name: string;
  file: string;
  description?: string;
};

export type BucketEvent = {
  handler: EventHandler;
  path?: string;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
};
