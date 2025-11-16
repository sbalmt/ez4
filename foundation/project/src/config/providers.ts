import type { ProjectOptions } from '../types/project';

import { isAnyObject } from '@ez4/utils';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

export const loadProviders = async (options: ProjectOptions) => {
  const packageFile = options.packageFile ?? 'package.json';
  const packagePath = join(process.cwd(), packageFile);

  const { namespace, providers } = await fetchProviderPackages(packagePath);

  const allProviders = providers.map(async (packageName) => {
    const registerTriggers = await tryImportProvider([`${packageName}/library`, packageName]);

    if (registerTriggers) {
      registerTriggers();
    }
  });

  await Promise.all(allProviders);

  return namespace;
};

const fetchProviderPackages = async (packagePath: string) => {
  const packageUrl = pathToFileURL(packagePath).href;

  const { default: packageJson } = await import(packageUrl, {
    with: {
      type: 'json'
    }
  });

  const allDependencies = {
    ...packageJson.devDependencies,
    ...packageJson.dependencies
  };

  const providers = Object.keys(allDependencies).filter((packageName) => {
    return packageName.startsWith('@ez4/');
  });

  const namespace = packageJson.name?.split('/', 2)[0];

  return {
    namespace,
    providers
  };
};

const tryImportProvider = async (packageNames: string[]) => {
  for (const packageName of packageNames) {
    try {
      const { registerTriggers } = await import(packageName);

      if (registerTriggers) {
        return registerTriggers;
      }
    } catch (error) {
      if (!isAnyObject(error) || error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
        throw error;
      }
    }
  }
};
