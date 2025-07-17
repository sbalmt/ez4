import type { ServiceMetadata } from './service.js';

export type MetadataReflection = Record<string, ServiceMetadata>;

export type MetadataDependencies = Record<string, string[]>;

export type MetadataServiceResult = {
  services: MetadataReflection;
  errors: Error[];
};
