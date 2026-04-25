import type { ServeOptions } from '@ez4/project/library';
import type { Bucket, Client, Content, ObjectEntry, SignReadOptions, SignWriteOptions } from '@ez4/storage';

import { copyFile, mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

import { fileTypeFromFile } from 'file-type';

import { isAnyObject, toKebabCase } from '@ez4/utils';
import { getServiceName } from '@ez4/project/library';
import { BucketEventType } from '@ez4/storage';
import { Logger } from '@ez4/logger';

export type LocalClientOptions = ServeOptions & {
  events?: {
    handler: (event: Bucket.ObjectEvent) => Promise<void>;
    prefix: string;
    suffix: string;
  }[];
};

export const createLocalClient = (resourceName: string, options: LocalClientOptions): Client => {
  const storageIdentifier = getServiceName(resourceName, options);
  const storageDirectory = join('.ez4', toKebabCase(resourceName));
  const storageEvents = options.events;

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

      storageEvents?.forEach(async ({ prefix, suffix, handler }) => {
        if (key.startsWith(prefix) && key.endsWith(suffix)) {
          const stats = await stat(filePath);

          await handler({
            eventType: BucketEventType.Create,
            bucketName: storageIdentifier,
            objectSize: stats.size,
            objectKey: key
          });
        }
      });
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

      storageEvents?.forEach(async ({ prefix, suffix, handler }) => {
        if (key.startsWith(prefix) && key.endsWith(suffix)) {
          await handler({
            eventType: BucketEventType.Delete,
            bucketName: storageIdentifier,
            objectKey: key
          });
        }
      });
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
        const { size, mtime } = await stat(join(storageDirectory, filePath));

        yield {
          key: filePath,
          modifiedAt: mtime,
          size
        };
      }
    }

    async getStatUrl(key: string, _options: SignReadOptions) {
      return Promise.resolve(`http://${options.serviceHost}/${storageIdentifier}/${key}`);
    }

    async getWriteUrl(key: string, _options: SignWriteOptions) {
      return Promise.resolve(`http://${options.serviceHost}/${storageIdentifier}/${key}`);
    }

    async getReadUrl(key: string, _options: SignReadOptions) {
      return Promise.resolve(`http://${options.serviceHost}/${storageIdentifier}/${key}`);
    }
  })();
};
