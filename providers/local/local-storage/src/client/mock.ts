import type { Client, Content } from '@ez4/storage';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

const contentMock = Buffer.from('This is a mock content.');

export const createMockedClient = (serviceName: string): Client => {
  const storageIdentifier = toKebabCase(serviceName);
  const storageMemory: Record<string, boolean> = {};

  return new (class {
    async exists(key: string) {
      return !!storageMemory[key];
    }

    async write(key: string, _contents: Content) {
      Logger.debug(`⬆️  File ${key} uploaded.`);

      storageMemory[key] = true;
    }

    async read(key: string): Promise<Buffer> {
      if (!storageMemory[key]) {
        throw new Error(`Key ${key} not found.`);
      }

      Logger.debug(`⬇️  File ${key} downloaded.`);

      return Buffer.from(contentMock);
    }

    async delete(key: string) {
      if (!storageMemory[key]) {
        throw new Error(`Key ${key} not found.`);
      }

      Logger.debug(`ℹ️  File ${key} deleted.`);

      delete storageMemory[key];
    }

    async getWriteUrl(key: string): Promise<string> {
      return `http://${storageIdentifier}/${key}`;
    }

    async getReadUrl(key: string): Promise<string> {
      return `http://${storageIdentifier}/${key}`;
    }

    async getStats(key: string) {
      if (!storageMemory[key]) {
        throw new Error(`Key ${key} not found.`);
      }

      return {
        type: 'application/octet-stream',
        size: contentMock.byteLength
      };
    }
  })();
};
