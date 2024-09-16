import type { BucketState } from '@ez4/aws-bucket';

import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { createBucketObject } from '@ez4/aws-bucket';
import { EntryStates } from '@ez4/stateful';

export const prepareLocalContent = async (
  state: EntryStates,
  bucketState: BucketState,
  localPath: string
) => {
  const basePath = join(process.cwd(), localPath);

  const allFiles = await readdir(basePath, {
    withFileTypes: true,
    recursive: true
  });

  for (const file of allFiles) {
    if (!file.isFile()) {
      continue;
    }

    const filePath = join(file.parentPath, file.name);
    const objectKey = relative(basePath, filePath);

    createBucketObject(state, bucketState, {
      objectKey,
      filePath
    });
  }
};
