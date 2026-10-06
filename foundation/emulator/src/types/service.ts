import type { AnyObject } from '@ez4/utils';

export type ServiceReferences = Record<string, string>;

export type ServiceDescriptors = Record<string, AnyServiceDescriptor>;

export type ServiceFactories = Record<string, () => AnyObject>;

export type AnyServiceDescriptor = FileServiceDescriptor | ModuleServiceDescriptor;

export type ServiceDescriptor = {
  name: string;
  provider?: string;
  options?: AnyObject;
};

export type FileServiceDescriptor = ServiceDescriptor & {
  file: string;
};

export type ModuleServiceDescriptor = ServiceDescriptor & {
  module: string;
};
