import type { ServiceEmulators } from '../../emulator/service';
import type { ProjectOptions } from '../../types/project';
import type { ServeOptions } from '../../types/options';
import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';

import { createServer } from 'node:http';

import { warnUnsupportedFlags } from '../../utils/flags';
import { getServiceAddress, getServicePort } from '../../utils/project';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/utils/hooks';
import { getServiceEmulators } from '../../emulator/service';
import { getServeOptions } from '../../emulator/options';
import { watchMetadata } from '../../library/metadata';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProviders } from '../../config/providers';
import { upgradeHandler } from '../../serve/upgrade';
import { requestHandler } from '../../serve/request';
import { loadImports } from '../../config/imports';

export const serveCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getServeOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths, allImports, namespacePath] = await DynamicLogger.logExecution('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadImports(project), loadProviders(project)]);
  });

  warnUnsupportedFlags(input, {
    reset: options.local,
    inspect: true,
    suppress: true,
    local: true
  });

  let emulators: ServiceEmulators = {};
  let isRunning = false;

  const additionalPaths = project.watchOptions?.additionalPaths ?? [];

  options.imports = allImports;

  const sourceWatcher = await watchMetadata(project.sourceFiles, {
    additionalPaths: [namespacePath, ...additionalPaths],
    aliasPaths,
    onMetadataReady: async (metadata) => {
      if (isRunning) {
        await shutdownServices(emulators);
        Logger.space();
      }

      emulators = await DynamicLogger.logExecution('🔄️ Loading emulators', () => {
        return getServiceEmulators(metadata, options);
      });

      displayServices(emulators, options);

      if (!isRunning) {
        await prepareServices(emulators);
      }

      await bootstrapServices(emulators);

      if (isRunning) {
        Logger.log(`🚀 Project [${project.projectName}] reloaded`);
      }

      options.version++;

      isRunning = true;
    }
  });

  const server = createServer();

  const bindHost = getServiceAddress(project.serveOptions);
  const bindPort = getServicePort(project.serveOptions);

  server.on('request', (request, stream) => {
    return requestHandler(request, stream, emulators, options);
  });

  server.on('upgrade', (request, socket) => {
    return upgradeHandler(request, socket, emulators, options);
  });

  server.on('error', async () => {
    Logger.error(`Unable to serve project [${project.projectName}] at http://${options.serviceHost}`);
    await shutdownServices(emulators);
    sourceWatcher.stop();
  });

  server.listen(bindPort, bindHost, () => {
    Logger.log(`🚀 Project [${project.projectName}] up and running`);
  });
};

const displayServices = (emulators: ServiceEmulators, options: ServeOptions) => {
  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator.requestHandler) {
      Logger.log(`🌐 Serving ${emulator.type} [${emulator.name}] at http://${options.serviceHost}/${identifier}`);
    }

    if (emulator.connectHandler) {
      Logger.log(`🌐 Serving ${emulator.type} [${emulator.name}] at ws://${options.serviceHost}/${identifier}`);
    }
  }
};
