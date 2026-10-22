import type { ServiceEmulators } from '../../emulator/service';
import type { ServeOptions } from '../../types/options';
import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';
import { ProviderType, providerRegistered, startServer } from '@ez4/server';

import { warnUnsupportedFlags } from '../../utils/flags';
import { getServicesManifest, registerManifestProvider } from '../../manifest/service';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/utils/hooks';
import { getServiceEmulators } from '../../emulator/service';
import { getServeOptions } from '../../emulator/options';
import { loadReferences } from '../../config/references';
import { loadEnvironment } from '../../config/environment';
import { loadProviders } from '../../config/providers';
import { loadProject } from '../../config/project';
import { loadPaths } from '../../config/tsconfig';
import { watchMetadata } from '../../library/metadata';

export const serveCommand = async (input: InputOptions) => {
  const project = await loadProject(input.project);
  const options = getServeOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [paths, references, namespacePath] = await DynamicLogger.logExecution('⚡ Initializing', () => {
    return Promise.all([loadPaths(project), loadReferences(project), loadProviders(project)]);
  });

  if (input.environment) {
    loadEnvironment(input.environment);
  }

  warnUnsupportedFlags(input, {
    reset: options.local,
    environment: true,
    suppress: true,
    inspect: true,
    local: true
  });

  let emulators: ServiceEmulators = {};
  let isRunning = false;

  const additionalPaths = project.watchOptions?.additionalPaths ?? [];

  options.imports = references.imports;

  await startServer({
    name: project.projectName,
    host: project.serveOptions?.localHost,
    port: project.serveOptions?.localPort
  });

  registerManifestProvider(project.projectName, () => {
    return getServicesManifest(emulators, options);
  });

  await watchMetadata(project.sourceFiles, {
    additionalPaths: [namespacePath, ...additionalPaths],
    aliasPaths: { ...references.paths, ...paths },
    onMetadataReady: async (metadata) => {
      if (isRunning) {
        await shutdownServices(emulators);
        Logger.space();
      }

      emulators = await DynamicLogger.logExecution('🔄️ Loading emulators', () => {
        return getServiceEmulators(metadata, options);
      });

      if (!isRunning) {
        await prepareServices(emulators);
      }

      await bootstrapServices(emulators);

      displayServices(emulators, options);

      if (isRunning) {
        Logger.log(`🚀 Project [${project.projectName}] reloaded`);
      }

      isRunning = true;
    }
  });
};

const displayServices = (emulators: ServiceEmulators, options: ServeOptions) => {
  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (providerRegistered(identifier, ProviderType.Http)) {
      Logger.log(`🌐 Serving ${emulator.type} [${emulator.name}] at http://${options.serviceHost}/${identifier}`);
    }

    if (providerRegistered(identifier, ProviderType.Ws)) {
      Logger.log(`🌐 Serving ${emulator.type} [${emulator.name}] at ws://${options.serviceHost}/${identifier}`);
    }
  }
};
