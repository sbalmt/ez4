import type { ProjectOptions } from '../types/project';
import type { AnyObject } from '@ez4/utils';

import { isAnyObject } from '@ez4/utils';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { ProviderVersionMismatchError } from '../errors/provider';

export const loadProviders = async (options: ProjectOptions) => {
  const packageFile = options.packageFile ?? 'package.json';
  const packagePath = join(process.cwd(), packageFile);

  const { namespace, providers } = await fetchAllProviderPackages(packagePath);

  if (options.customProviders) {
    providers.push(...options.customProviders.packages);
  }

  const allProviders = providers.map(async (packageName) => {
    const registerTriggers = await tryImportProvider([`${packageName}/library`, packageName]);

    if (registerTriggers) {
      registerTriggers();
    }
  });

  await Promise.all(allProviders);

  return namespace;
};

const fetchAllProviderPackages = async (packagePath: string) => {
  const packageUrl = pathToFileURL(packagePath).href;

  const { default: packageJson } = await import(packageUrl, {
    with: {
      type: 'json'
    }
  });

  const namespace = packageJson.name?.split('/', 2)[0];

  return {
    providers: filterAllProviderPackages(packageJson),
    namespace
  };
};

const filterAllProviderPackages = (packageJson: AnyObject) => {
  let currentVersion: string | undefined;

  const allProviders = [];

  const allDependencies = {
    ...packageJson.devDependencies,
    ...packageJson.dependencies
  };

  for (const packageName in allDependencies) {
    const packageVersion = allDependencies[packageName];

    if (packageName.startsWith('@ez4/')) {
      allProviders.push(packageName);

      if (currentVersion && currentVersion !== packageVersion) {
        throw new ProviderVersionMismatchError();
      } else {
        currentVersion = packageVersion;
      }
    }
  }

  return allProviders;
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
