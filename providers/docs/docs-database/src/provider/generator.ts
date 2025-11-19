import type { GenerateResourceEvent } from '@ez4/project/library';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getDatabaseOutput } from '../generator/mermaid';
import { getDatabaseServices } from '../utils/service';

export const generateResource = async (event: GenerateResourceEvent) => {
  const { parameters, metadata } = event;

  const [command, outputPath = '.'] = parameters;

  switch (command) {
    case 'database:erd': {
      const databases = getDatabaseServices(metadata);

      for (const database of databases) {
        const outputFile = join(outputPath, `${toKebabCase(database.name)}-erd.mmd`);
        const outputContent = getDatabaseOutput(database);

        await writeFile(outputFile, outputContent);

        Logger.success(`ERD saved to ${outputFile}`);
      }

      return true;
    }
  }

  return null;
};
