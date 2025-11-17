import type { Client, Content } from '@ez4/storage';

import { Readable } from 'node:stream';

import { Logger } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export type ClientMockContents = {
  keys?: Record<string, Buffer>;
  default?: Buffer;
};

export const createClientMock = (serviceName: string, contents?: ClientMockContents): Client => {
  const storageIdentifier = toKebabCase(serviceName);
  const storageMemory = contents?.keys ?? {};

  return new (class {
    async exists(key: string) {
      const content = storageMemory[key] ?? contents?.default;

      return Promise.resolve(!!content);
    }

    async write(key: string, contents: Content) {
      Logger.debug(`⬆️  File ${key} uploaded.`);

      if (contents instanceof Readable) {
        storageMemory[key] = contents.read();
      } else {
        storageMemory[key] = Buffer.from(contents);
      }

      return Promise.resolve();
    }

    async read(key: string): Promise<Buffer> {
      const content = storageMemory[key] ?? contents?.default;

      if (!content) {
        throw new Error(`Key ${key} not found.`);
      }

      Logger.debug(`⬇️  File ${key} downloaded.`);

      return Promise.resolve(Buffer.from(content));
    }

    async delete(key: string) {
      if (!storageMemory[key]) {
        if (!contents?.default) {
          throw new Error(`Key ${key} not found.`);
        }

        return Promise.resolve();
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
      const content = storageMemory[key] ?? contents?.default;

      if (!content) {
        throw new Error(`Key ${key} not found.`);
      }

      return Promise.resolve({
        type: 'application/octet-stream',
        size: content.byteLength
      });
    }
  })();
};
