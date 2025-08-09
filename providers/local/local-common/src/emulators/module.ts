import type { LinkedVariables } from '@ez4/project/library';

import { Logger } from '@ez4/project/library';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { runWithVariables } from '../utils/environment.js';

export type VirtualFunction = <T>(...inputs: unknown[]) => Promise<T>;

export type VirtualModule = {
  listener?: VirtualFunction;
  handler: VirtualFunction;
};

export type ModuleEntrypoint = {
  file: string;
  module?: string;
  name: string;
};

export type ModuleDefinition = {
  listener?: ModuleEntrypoint | null;
  handler: ModuleEntrypoint;
  variables: LinkedVariables;
  version: number;
};

export const createModule = async (module: ModuleDefinition): Promise<VirtualModule> => {
  const { handler, listener, variables, version } = module;

  if (!listener || listener.file === handler.file) {
    const module = await loadModule(handler, variables, version);

    return {
      listener: listener ? prepareFunction(listener, variables, module[listener.name]) : undefined,
      handler: prepareFunction(handler, variables, module[handler.name])
    };
  }

  const { [listener.name]: listenerCallback } = await loadModule(listener, variables, version);
  const { [handler.name]: handlerCallback } = await loadModule(handler, variables, version);

  return {
    listener: prepareFunction(listener, variables, listenerCallback),
    handler: prepareFunction(handler, variables, handlerCallback)
  };
};

const prepareFunction = (entrypoint: ModuleEntrypoint, variables: LinkedVariables, callback: (...inputs: unknown[]) => any) => {
  return async <T>(...inputs: unknown[]): Promise<T> => {
    const headline = `${entrypoint.file} [${entrypoint.name}]`;

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

const loadModule = async (entrypoint: ModuleEntrypoint, variables: LinkedVariables, version: number) => {
  return runWithVariables(variables, () => {
    if (!entrypoint.module) {
      const moduleUrl = pathToFileURL(join(process.cwd(), entrypoint.file));

      return import(`${moduleUrl.href}?v=${version}`);
    }

    return import(entrypoint.module);
  });
};
