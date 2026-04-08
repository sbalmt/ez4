import type { ServeOptions } from '@ez4/project/library';
import type { Client, Content, ObjectEntry, SignReadOptions, SignWriteOptions } from '@ez4/storage';

import { copyFile, mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

import { isAnyObject, toKebabCase } from '@ez4/utils';
import { getServiceName } from '@ez4/project/library';
import { Logger } from '@ez4/logger';
import { fileTypeFromFile } from 'file-type';

export const createServiceClient = (serviceName: string, serveOptions: ServeOptions): Client => {
  const storageIdentifier = getServiceName(serviceName, serveOptions);
  const storageDirectory = join('.ez4', toKebabCase(serviceName));

  return new (class {
    async stat(key: string) {
      const filePath = join(storageDirectory, key);

      try {
        const type = await fileTypeFromFile(filePath);
        const stats = await stat(filePath);

        return {
          type: type?.mime ?? 'application/octet-stream',
          size: stats.size
        };
      } catch (error) {
        if (!isAnyObject(error) || error.code !== 'ENOENT') {
          throw error;
        }

        return undefined;
      }
    }

    async exists(key: string) {
      const filePath = join(storageDirectory, key);

      return Promise.resolve(existsSync(filePath));
    }

    async write(key: string, contents: Content) {
      const filePath = join(storageDirectory, key);

      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, contents);

      Logger.log(`⬆️  File ${key} uploaded.`);
    }

    async read(key: string): Promise<Buffer> {
      const filePath = join(storageDirectory, key);
      const fileContent = await readFile(filePath);

      Logger.log(`⬇️  File ${key} downloaded.`);

      return fileContent;
    }

    async delete(key: string) {
      const filePath = join(storageDirectory, key);

      await unlink(filePath);

      Logger.log(`ℹ️  File ${key} deleted.`);
    }

    async copy(sourceKey: string, targetKey: string) {
      const sourcePath = join(storageDirectory, sourceKey);
      const targetPath = join(storageDirectory, targetKey);

      await copyFile(sourcePath, targetPath);

      Logger.log(`ℹ️  File ${sourceKey} copied.`);
    }

    async *scan(): AsyncGenerator<ObjectEntry, void> {
      const allFiles = await readdir(storageDirectory, {
        recursive: true
      });

      for (const filePath of allFiles) {
        const { size, mtime } = await stat(filePath);

        yield {
          key: filePath,
          modifiedAt: mtime,
          size
        };
      }
    }

    async getStatUrl(key: string, _options: SignReadOptions) {
      return Promise.resolve(`http://${serveOptions.serviceHost}/${storageIdentifier}/${key}`);
    }

    async getWriteUrl(key: string, _options: SignWriteOptions) {
      return Promise.resolve(`http://${serveOptions.serviceHost}/${storageIdentifier}/${key}`);
    }

    async getReadUrl(key: string, _options: SignReadOptions) {
      return Promise.resolve(`http://${serveOptions.serviceHost}/${storageIdentifier}/${key}`);
    }
  })();
};
