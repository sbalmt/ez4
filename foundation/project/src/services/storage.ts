import { toKebabCase } from '@ez4/utils';

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const TemporaryFolder = '.ez4';

export const getTemporaryPath = (file: string) => {
  return join(TemporaryFolder, toKebabCase(file));
};

export const saveTemporaryFile = async (file: string, content: string | Buffer) => {
  await mkdir(TemporaryFolder, { recursive: true });

  const path = getTemporaryPath(file);

  await writeFile(path, content);
};

export const readTemporaryFile = async (file: string) => {
  const path = getTemporaryPath(file);

  if (!existsSync(path)) {
    return undefined;
  }

  const buffer = await readFile(path);

  return buffer.toString();
};
