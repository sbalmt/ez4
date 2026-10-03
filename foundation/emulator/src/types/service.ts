import type { AnyObject } from '@ez4/utils';

export type ServiceDescriptors = Record<string, ServiceAnyDescriptor>;

export type ServiceAnyDescriptor = ServiceFileDescriptor | ServiceModuleDescriptor;

export type ServiceFileDescriptor = {
  options?: AnyObject;
  provider?: string;
  file: string;
  name: string;
};

export type ServiceModuleDescriptor = {
  options?: AnyObject;
  provider?: string;
  module: string;
  name: string;
};
