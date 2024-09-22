import type { ProjectOptions } from '../types/project.js';

import { join } from 'node:path';

export const loadProviders = async (options: ProjectOptions) => {
  const packagePath = join(process.cwd(), options.packageFile ?? 'package.json');

  const projectProviders = await fetchProviderPackages(packagePath);

  await registerAllProviderPackages(projectProviders);
};

const fetchProviderPackages = async (packagePath: string) => {
  const { default: packageJson } = await import(packagePath, {
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
    return registerTriggers();
  }
};
