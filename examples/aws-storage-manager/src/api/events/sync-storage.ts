import type { Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';
import type { FileStorage } from '@/storage';

import { BucketEventType } from '@ez4/storage';

import { FileStatus } from '../../schemas/file';
import { deleteFile, updateFile } from '../repository';

/**
 * Handle storage changes.
 */
export async function syncStorageHandler(request: Bucket.ObjectEvent, { fileDb }: Service.Context<FileStorage>): Promise<void> {
  switch (request.eventType) {
    case BucketEventType.Create: {
      console.log('New file created.');

      await updateFile(fileDb, {
        id: request.objectKey,
        status: FileStatus.Completed
      });

      break;
    }

    case BucketEventType.Delete: {
      console.log('File removed.');

      await deleteFile(fileDb, request.objectKey);

      break;
    }
  }

  // Do another stuff...
}
