import { Logger } from '@ez4/project/library';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

export type ModuleFunction = {
  file: string;
  name: string;
};

export type ModuleDefinition = {
  handler: ModuleFunction;
  listener?: ModuleFunction;
  reload?: boolean;
};

export const createModule = async (module: ModuleDefinition) => {
  const { handler, listener, reload = true } = module;

  if (!listener || listener.file === handler.file) {
    const module = await loadModule(handler.file, reload);

    return {
      listener: listener && prepareFunction(listener, module[listener.name]),
      handler: prepareFunction(handler, module[handler.name])
    };
  }

  const { [listener.name]: listenerCallback } = await loadModule(listener.file, reload);
  const { [handler.name]: handlerCallback } = await loadModule(handler.file, reload);

  return {
    listener: prepareFunction(listener, listenerCallback),
    handler: prepareFunction(handler, handlerCallback)
  };
};

const prepareFunction = (moduleFunction: ModuleFunction, callback: (...inputs: unknown[]) => unknown) => {
  return async (...inputs: unknown[]) => {
    try {
      Logger.log(`${moduleFunction.file} [${moduleFunction.name}] Start`);

      return await callback(...inputs);
    } catch (error) {
      Logger.error(`${moduleFunction.file} [${moduleFunction.name}] ${error}`);

      throw error;
    } finally {
      Logger.log(`${moduleFunction.file} [${moduleFunction.name}] End`);
    }
  };
};

const loadModule = async (file: string, reload: boolean) => {
  const moduleFile = pathToFileURL(join(process.cwd(), file)).href;
  const modulePath = `${moduleFile}?v=${reload ? Date.now() : 0}`;

  return import(modulePath);
};
