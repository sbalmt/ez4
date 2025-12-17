import type { LinkedVariables } from '@ez4/project/library';

import { Logger } from '@ez4/project/library';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { runWithVariables } from './utils/environment';

export type EntrypointFunction = <T>(...inputs: unknown[]) => Promise<T>;

export type EntrypointModule = {
  invoke: EntrypointFunction;
};

export type EntrypointSource = {
  file: string;
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
  const headline = `${entrypoint.file} [${entrypoint.name}]`;

  return async <T>(...inputs: unknown[]): Promise<T> => {
    let failed = false;

    try {
      return await runWithVariables(variables, () => {
        Logger.debug(`▶️  ${headline} Started`);
        return callback(...inputs);
      });
      //
    } catch (error) {
      Logger.error(`${headline} ${error}`);
      failed = true;
      throw error;
      //
    } finally {
      if (failed) {
        Logger.error(`${headline} Finished (with error)`);
      } else {
        Logger.success(`${headline} Finished`);
      }
    }
  };
};
