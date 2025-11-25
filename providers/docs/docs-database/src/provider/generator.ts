import type { GenerateResourceEvent, MetadataReflection } from '@ez4/project/library';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { EntityRelationshipGenerator } from '../generator/erd';
import { getDatabaseServices } from '../utils/service';

export const generateResource = async (event: GenerateResourceEvent) => {
  const { parameters, metadata } = event;

  const [command, outputPath = '.'] = parameters;

  switch (command) {
    case 'database:erd': {
      await generateEntityRelationshipDiagram(outputPath, metadata);
      return true;
    }
  }

  return null;
};

const generateEntityRelationshipDiagram = async (outputPath: string, metadata: MetadataReflection) => {
  const databases = getDatabaseServices(metadata);

  for (const database of databases) {
    const outputFile = join(outputPath, `${toKebabCase(database.name)}-erd.mmd`);
    const outputContent = EntityRelationshipGenerator.getDatabaseOutput(database);

    await writeFile(outputFile, outputContent);

    Logger.success(`Database ERD written to ${outputFile}`);
  }
};
