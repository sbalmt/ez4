import { isAbsolute, relative, resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

import { arrayUnique } from '@ez4/utils';

const HASH_CACHE = new Map<string, string>();
const PATH_CACHE = new Map<string, string>();

export const clearHashCache = () => {
  HASH_CACHE.clear();
  PATH_CACHE.clear();
};

export const getBundleHash = async (cacheKey: string, sourceFiles: string[], workspacePath: string) => {
  let bundleHash = HASH_CACHE.get(cacheKey);

  if (!bundleHash) {
    bundleHash = await getFilesHash(arrayUnique(sourceFiles), workspacePath);

    HASH_CACHE.set(cacheKey, bundleHash);
  }

  return bundleHash;
};

const getFilesHash = async (sourceFiles: string[], workspacePath: string) => {
  const operations = sourceFiles.map(async (filePath) => {
    const absolutePath = isAbsolute(filePath) ? filePath : resolve(workspacePath, filePath);
    const relativePath = relative(workspacePath, absolutePath);

    let contentHash = PATH_CACHE.get(absolutePath);

    if (!contentHash) {
      const contentData = await readFile(absolutePath);

      contentHash = createHash('sha256').update(contentData).digest('hex');

      PATH_CACHE.set(absolutePath, contentHash);
    }

    return {
      filePath: relativePath,
      pathHash: `${relativePath}:${contentHash}`
    };
  });

  const pathHashes = await Promise.all(operations);

  // Ensure the same position to not trigger updates without real changes.
  pathHashes.sort((a, b) => a.filePath.localeCompare(b.filePath));

  const fileSignatures = createHash('sha256');

  for (const { pathHash } of pathHashes) {
    fileSignatures.update(pathHash);
  }

  return fileSignatures.digest('hex');
};
