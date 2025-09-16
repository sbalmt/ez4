import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { normalize, join, sep, parse } from 'node:path';
import { existsSync } from 'node:fs';

const TemporaryFolder = '.ez4';

export const getTemporaryPath = (file: string) => {
  const { dir, base } = parse(file);

  const path = normalize(dir).replaceAll(`..${sep}`, '');

  return join(TemporaryFolder, path, base);
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
