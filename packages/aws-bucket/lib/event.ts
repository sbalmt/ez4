import type { S3Event, Context } from 'aws-lambda';
import type { BucketEvent } from '@ez4/storage';
import type { Service } from '@ez4/common';

import { EventType } from '@ez4/common';
import { BucketEventType } from '@ez4/storage';

declare const __EZ4_CONTEXT: object;

declare function handle(event: BucketEvent, context: object): Promise<any>;
declare function dispatch(event: Service.Event<BucketEvent>, context: object): Promise<void>;

/**
 * Entrypoint to handle S3 notifications.
 */
export async function s3EntryPoint(event: S3Event, context: Context): Promise<void> {
  let currentRequest: BucketEvent | undefined;

  const request = {
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

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

      await onReady(currentRequest);

      await handle(currentRequest, __EZ4_CONTEXT);
    }
  } catch (error) {
    await onError(error, currentRequest ?? request);
  } finally {
    await onEnd(request);
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

const onBegin = async (request: Partial<BucketEvent>) => {
  return dispatch(
    {
      type: EventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Partial<BucketEvent>) => {
  return dispatch(
    {
      type: EventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: Error, request: Partial<BucketEvent>) => {
  console.error(error);

  return dispatch(
    {
      type: EventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const onEnd = async (request: Partial<BucketEvent>) => {
  return dispatch(
    {
      type: EventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
