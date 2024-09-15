import type {
  Client as BucketClient,
  Content,
  SignedReadOptions,
  SignedWriteOptions
} from '@ez4/storage';

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

import mime from 'mime/lite';

const client = new S3Client({});

export namespace Client {
  export const make = (bucketName: string): BucketClient => {
    return new (class {
      async exists(key: string) {
        try {
          await client.send(
            new HeadObjectCommand({
              Bucket: bucketName,
              Key: key
            })
          );

          return true;
        } catch (error) {
          if (error instanceof NotFound || error instanceof NoSuchKey) {
            return false;
          }

          throw error;
        }
      }

      async write(key: string, contents: Content) {
        const contentType = mime.getType(key);

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

      async getWriteUrl(key: string, options: SignedWriteOptions): Promise<string> {
        const { expiresIn, contentType } = options;

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: contentType
        });

        return getSignedUrl(client, command, {
          signableHeaders: new Set(['content-type']),
          expiresIn
        });
      }

      async getReadUrl(key: string, options: SignedReadOptions): Promise<string> {
        const { expiresIn } = options;

        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: key
        });

        return getSignedUrl(client, command, {
          expiresIn
        });
      }
    })();
  };
}
