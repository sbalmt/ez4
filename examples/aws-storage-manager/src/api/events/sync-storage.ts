import { BucketEventType, type BucketEvent } from '@ez4/storage';

/**
 * Handle storage changes.
 */
export async function syncStorageHandler(request: BucketEvent): Promise<void> {
  console.log('Event', JSON.stringify(request));

  switch (request.eventType) {
    case BucketEventType.Create:
      console.log('New file created.');
      break;

    case BucketEventType.Delete:
      console.log('File removed.');
      break;
  }
}
