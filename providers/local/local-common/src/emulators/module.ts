import type { LinkedVariables } from '@ez4/project/library';

import { Logger } from '@ez4/project/library';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { runWithVariables } from './environment.js';

export type VirtualFunction = <T>(...inputs: unknown[]) => Promise<T>;

export type VirtualModule = {
  listener?: VirtualFunction;
  handler: VirtualFunction;
};

export type ModuleEntrySource = {
  file: string;
  name: string;
};

export type ModuleDefinition = {
  variables?: LinkedVariables;
  listener?: ModuleEntrySource | null;
  handler: ModuleEntrySource;
};

export const createModule = async (module: ModuleDefinition): Promise<VirtualModule> => {
  const { handler, listener, variables = {} } = module;

  if (!listener || listener.file === handler.file) {
    const module = await loadModule(handler.file, variables);

    return {
      listener: listener ? prepareFunction(listener, variables, module[listener.name]) : undefined,
      handler: prepareFunction(handler, variables, module[handler.name])
    };
  }

  const { [listener.name]: listenerCallback } = await loadModule(listener.file, variables);
  const { [handler.name]: handlerCallback } = await loadModule(handler.file, variables);

  return {
    listener: prepareFunction(listener, variables, listenerCallback),
    handler: prepareFunction(handler, variables, handlerCallback)
  };
};

const prepareFunction = (entrySource: ModuleEntrySource, variables: LinkedVariables, callback: (...inputs: unknown[]) => any) => {
  return async <T>(...inputs: unknown[]): Promise<T> => {
    try {
      return await runWithVariables(variables, () => {
        Logger.log(`▶️  ${entrySource.file} [${entrySource.name}] Start`);
        return callback(...inputs);
      });
      //
    } catch (error) {
      Logger.error(`❌ ${entrySource.file} [${entrySource.name}] ${error}`);
      throw error;
      //
    } finally {
      Logger.log(`✅ ${entrySource.file} [${entrySource.name}] Finish`);
    }
  };
};

const loadModule = async (file: string, variables: LinkedVariables) => {
  const modulePath = pathToFileURL(join(process.cwd(), file)).href;

  return runWithVariables(variables, async () => {
    return import(`${modulePath}?v=${Date.now()}`);
  });
};
