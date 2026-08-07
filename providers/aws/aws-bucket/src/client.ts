import type { Content, WriteOptions, SignReadOptions, SignWriteOptions, ObjectEntry } from '@ez4/storage';
import type { Client as BucketClient } from '@ez4/storage';

import type {
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

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import mime from 'mime';

type S3Cache = {
  s3Client: S3Client;
  GetObjectCommand: typeof GetObjectCommand;
  PutObjectCommand: typeof PutObjectCommand;
  HeadObjectCommand: typeof HeadObjectCommand;
  ListObjectsV2Command: typeof ListObjectsV2Command;
  DeleteObjectCommand: typeof DeleteObjectCommand;
  CopyObjectCommand: typeof CopyObjectCommand;
  NoSuchKey: typeof NoSuchKey;
  NotFound: typeof NotFound;
};

let S3_CACHE: Promise<S3Cache> | undefined;

export namespace Client {
  export const make = (bucketName: string): BucketClient => {
    return new (class {
      async stat(key: string) {
        const { s3Client, HeadObjectCommand, NotFound, NoSuchKey } = await getS3Client();

        try {
          const response = await s3Client.send(
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
        const { s3Client, PutObjectCommand } = await getS3Client();

        const { contentType = mime.getType(key), headers = {}, metadata } = options;

        await s3Client.send(
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
        const { s3Client, GetObjectCommand } = await getS3Client();

        const response = await s3Client.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: key
          })
        );

        const content = await response.Body!.transformToByteArray();

        return Buffer.from(content);
      }

      async delete(key: string) {
        const { s3Client, DeleteObjectCommand } = await getS3Client();

        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
          })
        );
      }

      async copy(sourceKey: string, targetKey: string) {
        const { s3Client, CopyObjectCommand } = await getS3Client();

        if (sourceKey !== targetKey) {
          await s3Client.send(
            new CopyObjectCommand({
              Bucket: bucketName,
              CopySource: `${bucketName}/${sourceKey}`,
              Key: targetKey
            })
          );
        }
      }

      async *scan(keyPrefix?: string): AsyncGenerator<ObjectEntry, void> {
        const { s3Client, ListObjectsV2Command } = await getS3Client();

        let nextPage: string | undefined;

        do {
          const response = await s3Client.send(
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
        const { s3Client, HeadObjectCommand } = await getS3Client();

        const { expiresIn } = options;

        const command = new HeadObjectCommand({
          Bucket: bucketName,
          Key: key
        });

        return getSignedUrl(s3Client, command, {
          expiresIn
        });
      }

      async getWriteUrl(key: string, options: SignWriteOptions) {
        const { s3Client, PutObjectCommand } = await getS3Client();

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

        return getSignedUrl(s3Client, command, {
          signableHeaders: new Set(signedHeaders),
          expiresIn
        });
      }

      async getReadUrl(key: string, options: SignReadOptions) {
        const { s3Client, GetObjectCommand } = await getS3Client();

        const { expiresIn } = options;

        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: key
        });

        return getSignedUrl(s3Client, command, {
          expiresIn
        });
      }
    })();
  };
}

const getS3Client = async () => {
  if (!S3_CACHE) {
    S3_CACHE = import('@aws-sdk/client-s3')
      .then(
        ({
          S3Client,
          GetObjectCommand,
          PutObjectCommand,
          HeadObjectCommand,
          ListObjectsV2Command,
          DeleteObjectCommand,
          CopyObjectCommand,
          NoSuchKey,
          NotFound
        }) => {
          return {
            s3Client: new S3Client(),
            GetObjectCommand,
            PutObjectCommand,
            HeadObjectCommand,
            ListObjectsV2Command,
            DeleteObjectCommand,
            CopyObjectCommand,
            NoSuchKey,
            NotFound
          };
        }
      )
      .catch((error) => {
        S3_CACHE = undefined;
        throw error;
      });
  }

  return S3_CACHE;
};
