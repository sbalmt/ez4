import type { ServeOptions } from '@ez4/project/library';
import type { Client, Content } from '@ez4/storage';

import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

import { isAnyObject, toKebabCase } from '@ez4/utils';
import { getServiceName } from '@ez4/project/library';

export const createStorageClient = (serviceName: string, serveOptions: ServeOptions): Client => {
  const storageIdentifier = getServiceName(serviceName, serveOptions);
  const storageDirectory = join('.ez4', toKebabCase(serviceName));

  return new (class {
    async exists(key: string) {
      const filePath = join(storageDirectory, key);

      return existsSync(filePath);
    }

    async write(key: string, contents: Content) {
      const filePath = join(storageDirectory, key);

      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, contents);
    }

    async read(key: string): Promise<Buffer> {
      const filePath = join(storageDirectory, key);

      return readFile(filePath);
    }

    async delete(key: string) {
      const filePath = join(storageDirectory, key);

      await unlink(filePath);
    }

    async getWriteUrl(key: string): Promise<string> {
      return `http://${serveOptions.host}/${storageIdentifier}/${key}`;
    }

    async getReadUrl(key: string): Promise<string> {
      return `http://${serveOptions.host}/${storageIdentifier}/${key}`;
    }

    async getStats(key: string) {
      const filePath = join(storageDirectory, key);

      try {
        const fileStat = await stat(filePath);

        return {
          type: 'application/octet-stream',
          size: fileStat.size
        };
      } catch (error) {
        if (!isAnyObject(error) || error.code !== 'ENOENT') {
          throw error;
        }

        return undefined;
      }
    }
  })();
};
