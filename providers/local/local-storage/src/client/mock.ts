import type { Client, Content, SignReadOptions, SignWriteOptions } from '@ez4/storage';

import { Readable } from 'node:stream';

import { fileTypeFromBuffer } from 'file-type';

import { toKebabCase } from '@ez4/utils';
import { Logger } from '@ez4/logger';

export type ClientMockOptions = {
  keys?: Record<string, Buffer>;
  default?: Buffer;
};

export const createClientMock = (serviceName: string, options?: ClientMockOptions): Client => {
  const storageIdentifier = toKebabCase(serviceName);
  const storageMemory = options?.keys ?? {};

  return new (class {
    async stat(key: string) {
      const content = storageMemory[key] ?? options?.default;

      if (!content) {
        return undefined;
      }

      const type = await fileTypeFromBuffer(content);

      return {
        type: type?.mime ?? 'application/octet-stream',
        size: content.byteLength
      };
    }

    async exists(key: string) {
      const content = storageMemory[key] ?? options?.default;

      return Promise.resolve(!!content);
    }

    async write(key: string, contents: Content) {
      Logger.log(`⬆️  File ${key} uploaded.`);

      if (contents instanceof Readable) {
        storageMemory[key] = contents.read();
      } else {
        storageMemory[key] = Buffer.from(contents);
      }

      return Promise.resolve();
    }

    async read(key: string): Promise<Buffer> {
      const content = storageMemory[key] ?? options?.default;

      if (!content) {
        throw new Error(`Key ${key} not found.`);
      }

      Logger.log(`⬇️  File ${key} downloaded.`);

      return Promise.resolve(Buffer.from(content));
    }

    async delete(key: string) {
      if (!storageMemory[key]) {
        if (!options?.default) {
          throw new Error(`Key ${key} not found.`);
        }

        return Promise.resolve();
      }

      Logger.log(`ℹ️  File ${key} deleted.`);

      delete storageMemory[key];

      return Promise.resolve();
    }

    async getStatUrl(key: string, _options: SignReadOptions): Promise<string> {
      return Promise.resolve(`http://${storageIdentifier}/${key}`);
    }

    async getWriteUrl(key: string, _options: SignWriteOptions): Promise<string> {
      return Promise.resolve(`http://${storageIdentifier}/${key}`);
    }

    async getReadUrl(key: string, _options: SignReadOptions): Promise<string> {
      return Promise.resolve(`http://${storageIdentifier}/${key}`);
    }
  })();
};
