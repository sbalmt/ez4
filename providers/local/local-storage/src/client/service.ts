import type { ServeOptions } from '@ez4/project/library';
import type { Client, Content } from '@ez4/storage';

import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

import { isAnyObject, toKebabCase } from '@ez4/utils';
import { getServiceName, Logger } from '@ez4/project/library';

export const createServiceClient = (serviceName: string, serveOptions: ServeOptions): Client => {
  const storageIdentifier = getServiceName(serviceName, serveOptions);
  const storageDirectory = join('.ez4', toKebabCase(serviceName));

  return new (class {
    async exists(key: string) {
      const filePath = join(storageDirectory, key);

      return Promise.resolve(existsSync(filePath));
    }

    async write(key: string, contents: Content) {
      const filePath = join(storageDirectory, key);

      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, contents);

      Logger.debug(`⬆️  File ${key} uploaded.`);
    }

    async read(key: string): Promise<Buffer> {
      const filePath = join(storageDirectory, key);
      const fileContent = await readFile(filePath);

      Logger.debug(`⬇️  File ${key} downloaded.`);

      return fileContent;
    }

    async delete(key: string) {
      const filePath = join(storageDirectory, key);

      await unlink(filePath);

      Logger.debug(`ℹ️  File ${key} deleted.`);
    }

    async getWriteUrl(key: string): Promise<string> {
      return Promise.resolve(`http://${serveOptions.serviceHost}/${storageIdentifier}/${key}`);
    }

    async getReadUrl(key: string): Promise<string> {
      return Promise.resolve(`http://${serveOptions.serviceHost}/${storageIdentifier}/${key}`);
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
