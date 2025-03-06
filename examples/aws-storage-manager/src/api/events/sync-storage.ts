import type { Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';
import type { FileStorage } from '../../storage.js';

import { BucketEventType } from '@ez4/storage';

import { FileStatus } from '../../schemas/file.js';
import { deleteFile, updateFile } from '../repository.js';

/**
 * Handle storage changes.
 */
export async function syncStorageHandler(
  request: Bucket.Event,
  context: Service.Context<FileStorage>
): Promise<void> {
  const { fileDb } = context;

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
