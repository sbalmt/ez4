import type { ProjectOptions } from '../types/project.js';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

export const loadProviders = async (options: ProjectOptions) => {
  const packageFile = options.packageFile ?? 'package.json';
  const packagePath = join(process.cwd(), packageFile);

  const projectProviders = await fetchProviderPackages(packagePath);

  await registerAllProviderPackages(projectProviders);
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

  return Object.keys(allDependencies).filter((packageName) => {
    return packageName.startsWith('@ez4/');
  });
};

const registerAllProviderPackages = async (packageNames: string[]) => {
  const allPromises = [];

  for (const packageName of packageNames) {
    allPromises.push(registerProviderPackage(packageName));
  }

  await Promise.all(allPromises);
};

const registerProviderPackage = async (packageName: string) => {
  const { registerTriggers } = await import(packageName);

  if (registerTriggers) {
    registerTriggers();
  }
};
