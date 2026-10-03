import type { AnyObject } from '@ez4/utils';
import type { ServiceAnyDescriptor, ServiceDescriptors } from './service';

export type ModuleInstance<T> = {
  invoke: (request: AnyObject) => Promise<T>;
};

export type ModuleManager = {
  createRequest: (base: AnyObject) => Promise<AnyObject> | AnyObject;
  prepareRequest: (minimal: AnyObject, services: AnyObject) => Promise<AnyObject> | AnyObject;
  finishRequest: (minimal: AnyObject, current?: AnyObject, error?: unknown) => Promise<AnyObject> | AnyObject;
};

export type ModuleEnvironment = {
  variables?: Record<string, string>;
  memory: number;
  timeout: number;
};

export type ModuleEntrypoint = {
  position: [number, number];
  module?: string;
  file: string;
  name: string;
};

export type ModuleOptions = {
  manager: ServiceAnyDescriptor;
  environment: ModuleEnvironment;
  services?: ServiceDescriptors;
  listener?: ModuleEntrypoint;
  handler: ModuleEntrypoint;
};
