import type { LinkedVariables } from '@ez4/project/library';

import { Logger } from '@ez4/logger';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { runWithVariables } from './utils/environment';

export type EntrypointFunction = <T>(...inputs: unknown[]) => Promise<T> | T;

export type EntrypointModule = {
  invoke: EntrypointFunction;
};

export type EntrypointSource = {
  file: string;
  position: [number, number];
  module?: string;
  name: string;
};

export type EmulatorModuleDefinition = {
  entrypoint: EntrypointSource;
  variables: LinkedVariables;
  version: number;
};

export const createEmulatorModule = async (module: EmulatorModuleDefinition): Promise<EntrypointModule> => {
  const { entrypoint, variables, version } = module;

  const { [entrypoint.name]: handler } = await runWithVariables(variables, () => {
    if (!entrypoint.module) {
      const moduleUrl = pathToFileURL(join(process.cwd(), entrypoint.file));

      return import(`${moduleUrl.href}?v=${version}`);
    }

    return import(entrypoint.module);
  });

  return {
    invoke: prepareFunction(entrypoint, variables, handler)
  };
};

const prepareFunction = (entrypoint: EntrypointSource, variables: LinkedVariables, callback: (...inputs: unknown[]) => any) => {
  const headline = `${entrypoint.file}:${entrypoint.position.join(':')} [${entrypoint.name}]`;

  const cleanupFunction = (error?: unknown) => {
    if (!error) {
      return Logger.success(`${headline} Finished`);
    }

    Logger.error(`${headline} ${error}`);
    Logger.error(`${headline} Finished (with error)`);
  };

  return <T>(...inputs: unknown[]): Promise<T> | T => {
    try {
      Logger.log(`▶️  ${headline} Started`);

      const result = runWithVariables(variables, () => callback(...inputs));

      if (result instanceof Promise) {
        return result
          .finally(() => cleanupFunction())
          .catch((error) => {
            cleanupFunction(error);
            throw error;
          });
      }

      cleanupFunction();

      return result;
      //
    } catch (error) {
      cleanupFunction(error);
      throw error;
    }
  };
};
