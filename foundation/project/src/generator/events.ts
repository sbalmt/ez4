import type { MetadataReflection } from '../types/metadata';
import type { CommonOptions } from '../types/options';

export type GenerateResourceEvent = {
  parameters: string[];
  metadata: MetadataReflection;
  options: CommonOptions;
};

export type GenerateHelpEvent = {
  options: CommonOptions;
};
