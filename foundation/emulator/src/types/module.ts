import type { AnyObject } from '@ez4/utils';
import type { AnyServiceDescriptor, ServiceDescriptors, ServiceReferences } from './service';

export type ModuleInstance<T> = {
  invoke: (request: AnyObject) => Promise<T>;
};

export type ModuleManager = {
  beginRequest: (original: AnyObject) => Promise<AnyObject> | AnyObject;
  prepareRequest: (minimal: AnyObject, original: AnyObject, context: AnyObject) => Promise<AnyObject> | AnyObject;
  finishRequest: (minimal: AnyObject, prepared?: AnyObject, error?: unknown) => Promise<AnyObject> | AnyObject;
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
  manager: AnyServiceDescriptor;
  environment: ModuleEnvironment;
  services?: ServiceDescriptors;
  references?: ServiceReferences;
  listener?: ModuleEntrypoint;
  handler: ModuleEntrypoint;
};
