import type { ServiceEmulators } from '../../emulator/service';
import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';
import { ProviderType, getServerAddress, providerRegistered, startServer } from '@ez4/server';
import { arrayUnique } from '@ez4/utils';

import { warnUnsupportedFlags } from '../../utils/flags';
import { getServicesManifest, registerManifestProvider } from '../../manifest/service';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/utils/hooks';
import { getServiceEmulators } from '../../emulator/service';
import { getServeOptions } from '../../emulator/options';
import { loadReferences } from '../../config/references';
import { loadEnvironment } from '../../config/environment';
import { loadProviders } from '../../config/providers';
import { loadProject } from '../../config/project';
import { watchMetadata } from '../../library/metadata';

export const serveCommand = async (input: InputOptions) => {
  if (input.environment) {
    loadEnvironment(input.environment);
  }

  const project = await loadProject(input.project);
  const options = getServeOptions(input, project);

  const serverAddress = getServerAddress({
    host: project.serveOptions?.localHost,
    port: project.serveOptions?.localPort
  });

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const references = await DynamicLogger.logExecution('⚡ Initializing', async () => {
    const { list: references } = await loadReferences(project, {
      branchName: input.branch,
      serverAddress
    });

    const list = references.filter(({ project }) => {
      const { projectName, serveOptions } = project;

      if (serveOptions?.disabled) {
        Logger.log(`ℹ️  [${projectName}] Serving disabled`);
        return false;
      }

      return true;
    });

    const operarions = list.map(async (reference) => {
      const namespace = await loadProviders(reference.project);

      return {
        namespacePath: namespace ? `**/node_modules/${namespace}/**` : undefined,
        ...reference
      };
    });

    return Promise.all(operarions);
  });

  warnUnsupportedFlags(input, {
    reset: options.local,
    environment: true,
    suppress: true,
    inspect: true,
    local: true
  });

  if (!references.length) {
    return Logger.log('ℹ️  No projects enabled for serving');
  }

  await startServer({
    name: project.projectName,
    host: project.serveOptions?.localHost,
    port: project.serveOptions?.localPort
  });

  for (const reference of references) {
    const projectOptions = getServeOptions(input, reference.project);

    let emulators: ServiceEmulators = {};
    let isRunning = false;

    projectOptions.serviceAddress = serverAddress;
    projectOptions.imports = reference.imports;

    registerManifestProvider(reference.project.projectName, () => {
      return getServicesManifest(emulators, projectOptions);
    });

    await watchMetadata(reference.project.sourceFiles, {
      workspacePath: reference.project.workspacePath,
      additionalPaths: arrayUnique(reference.namespacePath, reference.project.watchOptions?.additionalPaths),
      aliasPaths: reference.paths,
      onMetadataReady: async (metadata) => {
        if (isRunning) {
          await shutdownServices(emulators);
          Logger.space();
        }

        emulators = await DynamicLogger.logExecution('🔄️ Loading emulators', () => {
          return getServiceEmulators(metadata, projectOptions);
        });

        if (!isRunning) {
          await prepareServices(emulators);
        }

        await bootstrapServices(emulators);

        displayServices(emulators, serverAddress);

        if (isRunning) {
          Logger.log(`🚀 Project [${projectOptions.projectName}] reloaded`);
        }

        isRunning = true;
      }
    });
  }
};

const displayServices = (emulators: ServiceEmulators, address: string) => {
  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (providerRegistered(identifier, ProviderType.Http)) {
      Logger.log(`🌐 Serving ${emulator.type} [${emulator.name}] at http://${address}/${identifier}`);
    }

    if (providerRegistered(identifier, ProviderType.Ws)) {
      Logger.log(`🌐 Serving ${emulator.type} [${emulator.name}] at ws://${address}/${identifier}`);
    }
  }
};
