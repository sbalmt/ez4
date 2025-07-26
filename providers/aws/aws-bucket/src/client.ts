import type { Content, WriteOptions, SignReadOptions, SignWriteOptions } from '@ez4/storage';
import type { Client as BucketClient } from '@ez4/storage';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  NotFound,
  S3Client,
  NoSuchKey
} from '@aws-sdk/client-s3';

import mime from 'mime';

const client = new S3Client({});

export namespace Client {
  export const make = (bucketName: string): BucketClient => {
    return new (class {
      async exists(key: string) {
        return !!(await this.getStats(key));
      }

      async write(key: string, contents: Content, options?: WriteOptions) {
        const contentType = options?.contentType ?? mime.getType(key);

        await client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: contents,
            ...(contentType && {
              ContentType: contentType
            })
          })
        );
      }

      async read(key: string): Promise<Buffer> {
        const response = await client.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: key
          })
        );

        const content = await response.Body!.transformToByteArray();

        return Buffer.from(content);
      }

      async delete(key: string) {
        await client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
          })
        );
      }

      async getWriteUrl(key: string, options: SignWriteOptions): Promise<string> {
        const { expiresIn, contentType } = options;

        const command = new PutObjectCommand({
          Bucket: bucketName,
          ContentType: contentType,
          Key: key
        });

        return getSignedUrl(client, command, {
          signableHeaders: new Set(['content-type']),
          expiresIn
        });
      }

      async getReadUrl(key: string, options: SignReadOptions): Promise<string> {
        const { expiresIn } = options;

        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: key
        });

        return getSignedUrl(client, command, {
          expiresIn
        });
      }

      async getStats(key: string) {
        try {
          const response = await client.send(
            new HeadObjectCommand({
              Bucket: bucketName,
              Key: key
            })
          );

          return {
            type: response?.ContentType,
            size: response?.ContentLength ?? 0
          };
        } catch (error) {
          if (!(error instanceof NotFound) && !(error instanceof NoSuchKey)) {
            throw error;
          }

          return undefined;
        }
      }
    })();
  };
}
