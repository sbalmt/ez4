import type { AnyObject } from '@ez4/utils';
import type { ServiceAnyDescriptor, ServiceDescriptors } from './service';

export type WorkerInstance = {
  initialize: () => Promise<void>;
  invoke: (request: AnyObject) => Promise<unknown>;
  terminate: () => Promise<void>;
};

export type WorkerEnvironment = {
  variables?: Record<string, string>;
  memory: number;
};

export type WorkerEntrypoint = {
  module?: string;
  file: string;
  name: string;
};

export type WorkerOptions = {
  manager: ServiceAnyDescriptor;
  environment: WorkerEnvironment;
  services?: ServiceDescriptors;
  listener?: WorkerEntrypoint;
  handler: WorkerEntrypoint;
};
