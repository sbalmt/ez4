import type { ProjectOptions } from '../../types/project.js';
import type { EmulatorServices } from '../../library/emulator.js';
import type { ServeOptions } from '../../types/options.js';

import { Tester, Logger, LogLevel } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { loadProviders } from '../../common/providers.js';
import { getMetadata } from '../../library/metadata.js';
import { getEmulators } from '../../library/emulator.js';

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const TestFilePattern = /\.(spec|test)\.(js|ts)$/;

export const testCommand = async (project: ProjectOptions) => {
  const serveOptions = project.serveOptions;

  const serviceHost = serveOptions?.localHost ?? 'localhost';
  const servicePort = serveOptions?.localPort ?? 3734;

  const options: ServeOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    providerOptions: serveOptions?.providerOptions ?? {},
    serviceHost: `${serviceHost}:${servicePort}`,
    variables: project.variables,
    debug: project.debugMode,
    test: true,
    version: 0
  };

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  await Logger.execute('🔄️ Loading providers', () => {
    return loadProviders(project);
  });

  const emulators = await Logger.execute('🔄️ Loading emulators', () => {
    const { metadata } = getMetadata(project.sourceFiles);

    return getEmulators(metadata, options);
  });

  await Logger.execute('⚡ Running tests', async () => {
    await bootstrapServices(emulators);

    Tester.configure(emulators, options);
  });

  const testPath = process.cwd();

  const allFiles = await readdir(testPath, {
    recursive: true
  });

  for (const file of allFiles) {
    if (!TestFilePattern.test(file)) {
      continue;
    }

    await import(join(testPath, file));
  }
};

const bootstrapServices = async (emulators: EmulatorServices) => {
  process.env.EZ4_IS_LOCAL = 'true';

  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator.bootstrapHandler) {
      await emulator.bootstrapHandler();
    }
  }
};
