import type { CommonOptions, GenerateResourceEvent, MetadataReflection } from '@ez4/project/library';

import { toKebabCase } from '@ez4/utils';
import { Logger } from '@ez4/logger';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { TopologyGenerator } from '../generator/topology';

export const generateResource = async (event: GenerateResourceEvent) => {
  const { parameters, metadata, options } = event;

  const [command, outputPath = '.'] = parameters;

  switch (command) {
    case 'topology:graph': {
      await generateGraph(outputPath, metadata, options);
      return true;
    }
  }

  return null;
};

const generateGraph = async (outputPath: string, metadata: MetadataReflection, options: CommonOptions) => {
  const outputFile = join(outputPath, `${toKebabCase(options.projectName)}-topology.mmd`);
  const outputContent = TopologyGenerator.getTopologyOutput(metadata);

  await writeFile(outputFile, outputContent);

  Logger.success(`Topology Graph written to ${outputFile}`);
};
