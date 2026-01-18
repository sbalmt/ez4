import type { S3Event, Context } from 'aws-lambda';
import type { Bucket } from '@ez4/storage';

import { BucketEventType } from '@ez4/storage';
import { ServiceEventType, Runtime } from '@ez4/common';
import { getRandomUUID } from '@ez4/utils';

declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Bucket.ServiceEvent, context: object): Promise<void>;
declare function handle(event: Bucket.Event, context: object): Promise<any>;

/**
 * Entrypoint to handle S3 events.
 */
export async function s3EntryPoint(event: S3Event, context: Context): Promise<void> {
  let currentRequest: Bucket.Incoming | undefined;

  const request = {
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    for (const record of event.Records) {
      const eventType = getKnownEventType(record.eventName);

      const { bucket, object } = record.s3;

      const traceId = getRandomUUID();

      currentRequest = {
        ...request,
        bucketName: bucket.name,
        objectSize: object.size,
        objectKey: object.key,
        eventType,
        traceId
      };

      Runtime.setScope({
        traceId
      });

      await onReady(currentRequest);
      await handle(currentRequest, __EZ4_CONTEXT);
      await onDone(currentRequest);
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

const onBegin = async (request: Bucket.Request) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Bucket.Incoming) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: Bucket.Incoming) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: unknown, request: Bucket.Request | Bucket.Incoming) => {
  console.error({ ...Runtime.getScope(), error });

  return dispatch(
    {
      type: ServiceEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const onEnd = async (request: Bucket.Request) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
