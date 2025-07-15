import type { LinkedVariables } from '@ez4/project/library';

import { Logger } from '@ez4/project/library';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { attachVariables, detachVariables } from './environment.js';

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
  handler: ModuleEntrySource;
  listener?: ModuleEntrySource | null;
  variables?: LinkedVariables | null;
  reload?: boolean;
};

export const createModule = async (module: ModuleDefinition): Promise<VirtualModule> => {
  const { handler, listener, variables, reload = true } = module;

  if (!listener || listener.file === handler.file) {
    const module = await loadModule(handler.file, reload);

    return {
      listener: listener ? prepareFunction(listener, variables, module[listener.name]) : undefined,
      handler: prepareFunction(handler, variables, module[handler.name])
    };
  }

  const { [listener.name]: listenerCallback } = await loadModule(listener.file, reload);
  const { [handler.name]: handlerCallback } = await loadModule(handler.file, reload);

  return {
    listener: prepareFunction(listener, variables, listenerCallback),
    handler: prepareFunction(handler, variables, handlerCallback)
  };
};

const prepareFunction = (
  entrySource: ModuleEntrySource,
  variables: LinkedVariables | undefined | null,
  callback: (...inputs: unknown[]) => any
) => {
  return async <T>(...inputs: unknown[]): Promise<T> => {
    try {
      if (variables) {
        attachVariables(variables);
      }

      Logger.log(`${entrySource.file} [${entrySource.name}] Start`);

      return await callback(...inputs);
      //
    } catch (error) {
      Logger.error(`${entrySource.file} [${entrySource.name}] ${error}`);
      throw error;
      //
    } finally {
      Logger.log(`${entrySource.file} [${entrySource.name}] End`);

      if (variables) {
        detachVariables(variables);
      }
    }
  };
};

const loadModule = async (file: string, reload: boolean) => {
  const moduleFile = pathToFileURL(join(process.cwd(), file)).href;
  const modulePath = reload ? `${moduleFile}?v=${Date.now()}` : moduleFile;

  return import(modulePath);
};
