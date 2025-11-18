import type { ProjectOptions } from '../../types/project';
import type { ServeOptions } from '../../types/options';
import type { InputOptions } from '../options';

import { Runner, Logger, LogLevel } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { buildMetadata } from '../../library/metadata';
import { getServiceEmulators } from '../../emulator/utils';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/actions';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProviders } from '../../config/providers';
import { loadImports } from '../../config/imports';

import { join } from 'node:path';

export const runCommand = async (input: InputOptions, project: ProjectOptions) => {
  const serveOptions = project.serveOptions;

  const serviceHost = serveOptions?.localHost ?? 'localhost';
  const servicePort = serveOptions?.localPort ?? 3734;

  const options: ServeOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    serviceHost: `${serviceHost}:${servicePort}`,
    localOptions: project.localOptions ?? {},
    variables: project.variables,
    force: project.debugMode,
    debug: project.debugMode,
    reset: project.resetMode,
    local: project.localMode,
    test: true,
    version: 0
  };

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths, allImports] = await Logger.execute('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadImports(project), loadProviders(project)]);
  });

  options.imports = allImports;

  const emulators = await Logger.execute('🔄️ Loading emulators', () => {
    const { metadata } = buildMetadata(project.sourceFiles, {
      aliasPaths
    });

    return getServiceEmulators(metadata, options);
  });

  const workingDirectory = process.cwd();

  await Logger.execute('▶️  Running script', async () => {
    Runner.configure(emulators, options);

    await prepareServices(emulators);

    await bootstrapServices(emulators);

    if (input.arguments) {
      await import(join(workingDirectory, input.arguments));
    }

    await shutdownServices(emulators);
  });
};
