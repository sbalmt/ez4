import type { GenerateResourceEvent, MetadataReflection } from '@ez4/project/library';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { MermaidGenerator } from '../generator/mermaid';
import { getDatabaseServices } from '../utils/service';

export const generateResource = async (event: GenerateResourceEvent) => {
  const { parameters, metadata } = event;

  const [command, outputPath = '.'] = parameters;

  switch (command) {
    case 'database:erd': {
      await generateErd(outputPath, metadata);
      return true;
    }
  }

  return null;
};

const generateErd = async (outputPath: string, metadata: MetadataReflection) => {
  const databases = getDatabaseServices(metadata);

  for (const database of databases) {
    const outputFile = join(outputPath, `${toKebabCase(database.name)}-erd.mmd`);
    const outputContent = MermaidGenerator.getDatabaseOutput(database);

    await writeFile(outputFile, outputContent);

    Logger.success(`Database ERD written to ${outputFile}`);
  }
};
