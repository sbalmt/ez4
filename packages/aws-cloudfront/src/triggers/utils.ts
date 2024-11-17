import type { CdnOrigin, CdnService } from '@ez4/distribution/library';
import type { DeployOptions } from '@ez4/project/library';

import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getCachePolicyName = (
  service: CdnService,
  origin: CdnOrigin,
  options: DeployOptions
) => {
  const name = toKebabCase(origin.path ?? 'default');

  return `${getServiceName(service, options)}-${name}-cache`;
};

export const getOriginPolicyName = (service: CdnService, options: DeployOptions) => {
  return `${getServiceName(service, options)}-origin`;
};

export const getOriginAccessName = (service: CdnService, options: DeployOptions) => {
  return `${getServiceName(service, options)}-access`;
};

export const getContentVersion = async (localPath: string) => {
  const basePath = join(process.cwd(), localPath);
  const version = createHash('sha256');

  const allFiles = await readdir(basePath, {
    withFileTypes: true,
    recursive: true
  });

  for (const file of allFiles) {
    if (!file.isFile()) {
      continue;
    }

    const filePath = join(file.parentPath, file.name);
    const fileStat = await stat(filePath);

    const relativePath = relative(basePath, filePath);
    const lastModified = fileStat.mtime.getTime();

    version.update(`${relativePath}:${lastModified}`);
  }

  return version.digest('hex');
};
