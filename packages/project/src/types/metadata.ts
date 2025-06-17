import type { ServiceMetadata } from './service.js';

export type MetadataReflection = Record<string, ServiceMetadata>;

export type MetadataDependencies = Record<string, string[]>;

export type MetadataResult = {
  services: MetadataReflection;
  errors: Error[];
};
