import type { GenerateResourceEvent, MetadataReflection } from '@ez4/project/library';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getGatewayServices } from '../utils/service';
import { OpenApiGenerator } from '../generator/oas';

export const generateResource = async (event: GenerateResourceEvent) => {
  const { parameters, metadata } = event;

  const [command, outputPath = '.'] = parameters;

  switch (command) {
    case 'gateway:oas': {
      await generateOpenApiSpec(outputPath, metadata);
      return true;
    }
  }

  return null;
};

const generateOpenApiSpec = async (outputPath: string, metadata: MetadataReflection) => {
  const databases = getGatewayServices(metadata);

  for (const database of databases) {
    const outputFile = join(outputPath, `${toKebabCase(database.name)}-oas.yml`);
    const outputContent = OpenApiGenerator.getGatewayOutput(database);

    await writeFile(outputFile, outputContent);

    Logger.success(`Gateway OAS written to ${outputFile}`);
  }
};
