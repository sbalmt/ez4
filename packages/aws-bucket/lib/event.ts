import type { S3Event, Context } from 'aws-lambda';
import type { Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

import { ServiceEventType } from '@ez4/common';
import { BucketEventType } from '@ez4/storage';

declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Service.Event<Bucket.Event>, context: object): Promise<void>;
declare function handle(event: Bucket.Event, context: object): Promise<any>;

/**
 * Entrypoint to handle S3 notifications.
 */
export async function s3EntryPoint(event: S3Event, context: Context): Promise<void> {
  let currentRequest: Bucket.Event | undefined;

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

const onBegin = async (request: Partial<Bucket.Incoming>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Partial<Bucket.Incoming>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: Error, request: Partial<Bucket.Incoming>) => {
  console.error(error);

  return dispatch(
    {
      type: ServiceEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const onEnd = async (request: Partial<Bucket.Incoming>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
