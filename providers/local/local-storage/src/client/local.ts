import type { Client, Content, ObjectEntry, SignReadOptions, SignWriteOptions } from '@ez4/storage';
import type { ProviderContext } from '@ez4/emulator';

import { dirname, join, relative } from 'node:path';
import { copyFile, mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

import { fileTypeFromFile } from 'file-type';

import { BucketEventType } from '@ez4/storage';
import { isAnyObject } from '@ez4/utils';
import { Logger } from '@ez4/logger';

import { ProviderEvent } from '../types/events';

export type LocalClientOptions = {
  host: string;
  identifier: string;
  directory: string;
};

export const createLocalClient = (options: LocalClientOptions, context: Pick<ProviderContext, 'notify'>): Client => {
  const { identifier, directory, host } = options;

  return {
    stat: async (key: string) => {
      const filePath = join(directory, key);

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
    },
    exists: (key: string) => {
      const filePath = join(directory, key);

      return Promise.resolve(existsSync(filePath));
    },
    write: async (key: string, contents: Content) => {
      const filePath = join(directory, key);

      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, contents);

      Logger.log(`⬆️  File ${key} uploaded.`);

      const stats = await stat(filePath);

      context.notify(ProviderEvent.CreateFile, {
        eventType: BucketEventType.Create,
        bucketName: identifier,
        objectSize: stats.size,
        objectKey: key
      });
    },
    read: async (key: string) => {
      const filePath = join(directory, key);
      const fileContent = await readFile(filePath);

      Logger.log(`⬇️  File ${key} downloaded.`);

      return fileContent;
    },
    delete: async (key: string) => {
      const filePath = join(directory, key);

      await unlink(filePath);

      Logger.log(`ℹ️  File ${key} deleted.`);

      context.notify(ProviderEvent.DeleteFile, {
        eventType: BucketEventType.Delete,
        bucketName: identifier,
        objectKey: key
      });
    },
    copy: async (sourceKey: string, targetKey: string) => {
      const sourcePath = join(directory, sourceKey);
      const targetPath = join(directory, targetKey);

      await copyFile(sourcePath, targetPath);

      Logger.log(`ℹ️  File ${sourceKey} copied.`);

      const stats = await stat(targetPath);

      context.notify(ProviderEvent.CreateFile, {
        eventType: BucketEventType.Create,
        bucketName: identifier,
        objectSize: stats.size,
        objectKey: targetKey
      });
    },
    scan: async function* (keyPrefix?: string): AsyncGenerator<ObjectEntry, void> {
      const allEntries = await readdir(directory, {
        withFileTypes: true,
        recursive: true
      });

      const allMatching = allEntries
        .filter((entry) => entry.isFile())
        .map(({ parentPath, name }) => join(parentPath, name))
        .filter((path) => !keyPrefix || path.startsWith(keyPrefix, directory.length + 1))
        .sort();

      for (const filePath of allMatching) {
        const { size, mtime } = await stat(filePath);

        yield {
          key: relative(directory, filePath),
          modifiedAt: mtime,
          size
        };
      }
    },
    getStatUrl: (key: string, _options: SignReadOptions) => {
      return Promise.resolve(`http://${host}/${identifier}/${key}`);
    },
    getWriteUrl: (key: string, _options: SignWriteOptions) => {
      return Promise.resolve(`http://${host}/${identifier}/${key}`);
    },
    getReadUrl: (key: string, _options: SignReadOptions) => {
      return Promise.resolve(`http://${host}/${identifier}/${key}`);
    }
  };
};
