import type { BucketState } from '@ez4/aws-bucket';

import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { createBucketObject } from '@ez4/aws-bucket';
import { EntryStates } from '@ez4/stateful';

export const prepareLocalContent = async (state: EntryStates, bucketState: BucketState, localPath: string) => {
  const basePath = process.cwd();
  const fullPath = join(basePath, localPath);

  const allFiles = await readdir(fullPath, {
    withFileTypes: true,
    recursive: true
  });

  for (const file of allFiles) {
    if (!file.isFile()) {
      continue;
    }

    const filePath = join(file.parentPath, file.name);

    createBucketObject(state, bucketState, {
      objectKey: relative(fullPath, filePath),
      filePath: relative(basePath, filePath)
    });
  }
};
