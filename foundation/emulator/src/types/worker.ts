import type { AnyObject } from '@ez4/utils';
import type { AnyServiceDescriptor, ServiceDescriptors, ServiceReferences } from './service';

export type WorkerInstance = {
  initialize: () => Promise<void>;
  invoke: (request: AnyObject) => Promise<unknown>;
  terminate: () => Promise<void>;
};

export type WorkerEnvironment = {
  variables?: Record<string, string>;
  timeout: number;
  memory: number;
};

export type WorkerEntrypoint = {
  module?: string;
  file: string;
  name: string;
};

export type WorkerOptions = {
  manager: AnyServiceDescriptor;
  environment: WorkerEnvironment;
  services?: ServiceDescriptors;
  references?: ServiceReferences;
  listener?: WorkerEntrypoint;
  handler: WorkerEntrypoint;
};
