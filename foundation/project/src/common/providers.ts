import type { ProjectOptions } from '../types/project';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

export const loadProviders = async (options: ProjectOptions) => {
  const packageFile = options.packageFile ?? 'package.json';
  const packagePath = join(process.cwd(), packageFile);

  const { directory, providers } = await fetchProviderPackages(packagePath);

  const allProviders = providers.map(async (packageName) => {
    const registerTriggers = await tryImportProvider([`${packageName}/library`, packageName]);

    if (registerTriggers) {
      registerTriggers();
    }
  });

  await Promise.all(allProviders);

  return directory;
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

  const directory = packageJson.name?.split('/', 2)[0];

  return {
    directory,
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
    } catch {}
  }
};
