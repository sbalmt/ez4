import type { Content, WriteOptions, SignReadOptions, SignWriteOptions, ObjectEntry } from '@ez4/storage';
import type { Client as BucketClient } from '@ez4/storage';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  CopyObjectCommand,
  NoSuchKey,
  NotFound
} from '@aws-sdk/client-s3';

import mime from 'mime';

const client = new S3Client({});

export namespace Client {
  export const make = (bucketName: string): BucketClient => {
    return new (class {
      async stat(key: string) {
        try {
          const response = await client.send(
            new HeadObjectCommand({
              Bucket: bucketName,
              Key: key
            })
          );

          const { ContentType: type = 'application/octet-stream', ContentLength: size = 0, Metadata: metadata } = response;

          return {
            type,
            metadata,
            size
          };
        } catch (error) {
          if (!(error instanceof NotFound) && !(error instanceof NoSuchKey)) {
            throw error;
          }

          return undefined;
        }
      }

      async exists(key: string) {
        return !!(await this.stat(key));
      }

      async write(key: string, contents: Content, options: WriteOptions = {}) {
        const { contentType = mime.getType(key), headers = {}, metadata } = options;

        await client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: contents,
            Metadata: metadata,
            CacheControl: headers?.cacheControl,
            Expires: headers?.expires,
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

      async copy(sourceKey: string, targetKey: string) {
        if (sourceKey !== targetKey) {
          await client.send(
            new CopyObjectCommand({
              Bucket: bucketName,
              CopySource: `${bucketName}/${sourceKey}`,
              Key: targetKey
            })
          );
        }
      }

      async *scan(keyPrefix?: string): AsyncGenerator<ObjectEntry, void> {
        let nextPage: string | undefined;

        do {
          const response = await client.send(
            new ListObjectsV2Command({
              ContinuationToken: nextPage,
              Bucket: bucketName,
              Prefix: keyPrefix
            })
          );

          for (const object of response.Contents ?? []) {
            yield {
              key: object.Key!,
              modifiedAt: object.LastModified!,
              size: object.Size!
            };
          }

          nextPage = response.NextContinuationToken;
        } while (nextPage);
      }

      async getStatUrl(key: string, options: SignReadOptions) {
        const { expiresIn } = options;

        const command = new HeadObjectCommand({
          Bucket: bucketName,
          Key: key
        });

        return getSignedUrl(client, command, {
          expiresIn
        });
      }

      async getWriteUrl(key: string, options: SignWriteOptions) {
        const { expiresIn, contentType, metadata, headers = {} } = options;

        const command = new PutObjectCommand({
          Bucket: bucketName,
          ContentType: contentType,
          CacheControl: headers?.cacheControl,
          Expires: headers?.expires,
          Metadata: metadata,
          Key: key
        });

        const signedHeaders = ['content-type'];

        if (headers.cacheControl) {
          signedHeaders.push('cache-control');
        }

        if (headers.expires) {
          signedHeaders.push('expires');
        }

        return getSignedUrl(client, command, {
          signableHeaders: new Set(signedHeaders),
          expiresIn
        });
      }

      async getReadUrl(key: string, options: SignReadOptions) {
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
