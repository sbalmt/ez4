import type { S3Event, Context } from 'aws-lambda';
import { BucketEvent, BucketEventType } from '@ez4/storage';

declare function handle(event: BucketEvent, context: object): Promise<any>;

declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle S3 notifications.
 */
export async function s3EntryPoint(event: S3Event, context: Context): Promise<void> {
  for (const record of event.Records) {
    const eventType = getKnownEventType(record.eventName);

    if (!eventType) {
      throw new Error(`Event type ${eventType} isn't supported.`);
    }

    const { bucket, object } = record.s3;

    const request = {
      requestId: context.awsRequestId,
      bucketName: bucket.name,
      objectSize: object.size,
      objectKey: object.key,
      eventType
    };

    await handle(request, __EZ4_CONTEXT);
  }
}

const getKnownEventType = (eventName: string) => {
  if (eventName.startsWith('ObjectCreated:')) {
    return BucketEventType.Create;
  }

  if (eventName.startsWith('ObjectRemoved:')) {
    return BucketEventType.Delete;
  }

  return undefined;
};
