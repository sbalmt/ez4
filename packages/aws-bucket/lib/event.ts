import type { S3Event, Context } from 'aws-lambda';
import type { BucketEvent } from '@ez4/storage';
import type { Service } from '@ez4/common';

import { WatcherEventType } from '@ez4/common';
import { BucketEventType } from '@ez4/storage';

declare const __EZ4_CONTEXT: object;

declare function handle(event: BucketEvent, context: object): Promise<any>;
declare function watch(event: Service.WatcherEvent<BucketEvent>, context: object): Promise<void>;

/**
 * Entrypoint to handle S3 notifications.
 */
export async function s3EntryPoint(event: S3Event, context: Context): Promise<void> {
  let currentRequest: BucketEvent | undefined;

  const request = {
    requestId: context.awsRequestId
  };

  try {
    await watchBegin(request);

    for (const record of event.Records) {
      const eventType = getKnownEventType(record.eventName);

      const { bucket, object } = record.s3;

      currentRequest = {
        ...request,
        eventType,
        bucketName: bucket.name,
        objectSize: object.size,
        objectKey: object.key
      };

      await watchReady(currentRequest);

      await handle(currentRequest, __EZ4_CONTEXT);
    }
  } catch (error) {
    await watchError(error, currentRequest ?? request);
  } finally {
    await watchEnd(request);
  }
}

const getKnownEventType = (eventName: string) => {
  if (eventName.startsWith('ObjectCreated:')) {
    return BucketEventType.Create;
  }

  if (eventName.startsWith('ObjectRemoved:')) {
    return BucketEventType.Delete;
  }

  throw new Error(`Event type ${eventName} isn't supported.`);
};

const watchBegin = async (request: Partial<BucketEvent>) => {
  return watch(
    {
      type: WatcherEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const watchReady = async (request: Partial<BucketEvent>) => {
  return watch(
    {
      type: WatcherEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const watchError = async (error: Error, request: Partial<BucketEvent>) => {
  console.error(error);

  return watch(
    {
      type: WatcherEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const watchEnd = async (request: Partial<BucketEvent>) => {
  return watch(
    {
      type: WatcherEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
