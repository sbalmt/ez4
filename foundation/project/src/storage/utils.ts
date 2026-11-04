import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, normalize, resolve, sep, parse } from 'node:path';
import { existsSync } from 'node:fs';

const TemporaryFolder = '.ez4';

export const getTemporaryPath = (workspacePath: string, filePath: string) => {
  const { dir, base } = parse(filePath);

  const path = normalize(dir).replaceAll(`..${sep}`, '');

  return resolve(workspacePath, TemporaryFolder, path, base);
};

export const saveTemporaryFile = async (workspacePath: string, filePath: string, content: string | Buffer) => {
  const path = getTemporaryPath(workspacePath, filePath);

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
};

export const readTemporaryFile = async (workspacePath: string, filePath: string) => {
  const path = getTemporaryPath(workspacePath, filePath);

  if (!existsSync(path)) {
    return undefined;
  }

  const buffer = await readFile(path);

  return buffer.toString();
};
