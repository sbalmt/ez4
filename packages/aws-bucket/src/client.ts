import type {
  Client as BucketClient,
  SignedReadOptions,
  SignedWriteOptions,
  WriteOptions
} from '@ez4/storage';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  NotFound,
  S3Client
} from '@aws-sdk/client-s3';

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
          if (!(error instanceof NotFound)) {
            throw error;
          }

          return false;
        }
      }

      async write(key: string, data: ReadableStream, options?: WriteOptions) {
        await client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: data,
            Expires: options?.autoExpireDate
          })
        );
      }

      async read(key: string): Promise<ReadableStream> {
        const response = await client.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: key
          })
        );

        return response.Body!.transformToWebStream();
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
        const { expiresIn, contentType, autoExpireDate } = options;

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: contentType,
          Expires: autoExpireDate
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
