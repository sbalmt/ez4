import type { BucketState } from '@ez4/aws-bucket';

import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

import { createBucketObject } from '@ez4/aws-bucket';
import { EntryStates } from '@ez4/stateful';

export const connectLocalContent = async (
  state: EntryStates,
  bucketState: BucketState,
  localPath: string
) => {
  const contentVersion = createHash('sha256');

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

    const fileStat = await stat(filePath);

    createBucketObject(state, bucketState, {
      objectKey,
      filePath
    });

    const lastModified = fileStat.mtime.getTime();

    contentVersion.update(`${objectKey}:${lastModified}`);
  }

  return contentVersion.digest('hex');
};
