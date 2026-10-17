import type { AnyObject } from '@ez4/utils';
import type { AnyServiceDescriptor, ServiceDescriptors, ServiceReferences } from './service';

export type ModuleInstance<T> = {
  invoke: (request: AnyObject) => Promise<T>;
};

export type ModuleInvoker = (invocation: ModuleInvocation) => Promise<unknown>;

export type ModuleInvocation = {
  request: AnyObject;
  context: AnyObject;
  begin: (request: AnyObject) => Promise<void>;
  ready: (request: AnyObject) => Promise<void>;
  invoke: (request: AnyObject) => Promise<unknown>;
  done: (request: AnyObject) => Promise<void>;
  error: (error: unknown, request: AnyObject) => Promise<void>;
  end: (request: AnyObject) => Promise<void>;
};

export type ModuleEnvironment = {
  variables?: Record<string, string>;
  timeout: number;
  memory: number;
};

export type ModuleEntrypoint = {
  position: [number, number];
  module?: string;
  file: string;
  name: string;
};

export type ModuleOptions = {
  environment: ModuleEnvironment;
  services?: ServiceDescriptors;
  references?: ServiceReferences;
  invoker: AnyServiceDescriptor;
  listener?: ModuleEntrypoint;
  handler: ModuleEntrypoint;
};
