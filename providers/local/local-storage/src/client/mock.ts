import type { Client, Content } from '@ez4/storage';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

const contentMock = Buffer.from('This is a mock content.');

export const createMockClient = (serviceName: string): Client => {
  const storageIdentifier = toKebabCase(serviceName);
  const storageMemory: Record<string, boolean> = {};

  return new (class {
    async exists(key: string) {
      return Promise.resolve(!!storageMemory[key]);
    }

    async write(key: string, _contents: Content) {
      Logger.debug(`⬆️  File ${key} uploaded.`);

      storageMemory[key] = true;

      return Promise.resolve();
    }

    async read(key: string): Promise<Buffer> {
      if (!storageMemory[key]) {
        throw new Error(`Key ${key} not found.`);
      }

      Logger.debug(`⬇️  File ${key} downloaded.`);

      return Promise.resolve(Buffer.from(contentMock));
    }

    async delete(key: string) {
      if (!storageMemory[key]) {
        throw new Error(`Key ${key} not found.`);
      }

      Logger.debug(`ℹ️  File ${key} deleted.`);

      delete storageMemory[key];

      return Promise.resolve();
    }

    async getWriteUrl(key: string): Promise<string> {
      return Promise.resolve(`http://${storageIdentifier}/${key}`);
    }

    async getReadUrl(key: string): Promise<string> {
      return Promise.resolve(`http://${storageIdentifier}/${key}`);
    }

    async getStats(key: string) {
      if (!storageMemory[key]) {
        throw new Error(`Key ${key} not found.`);
      }

      return Promise.resolve({
        type: 'application/octet-stream',
        size: contentMock.byteLength
      });
    }
  })();
};
