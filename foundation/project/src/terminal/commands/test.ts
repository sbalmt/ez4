import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { Tester, Logger, LogLevel } from '@ez4/project/library';

import { buildMetadata } from '../../library/metadata';
import { getServiceEmulators } from '../../emulator/utils';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/actions';
import { getServeOptions } from '../../emulator/options';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProviders } from '../../config/providers';
import { loadImports } from '../../config/imports';

import { once } from 'node:events';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { run } from 'node:test';

const TestFilePattern = /\.(spec|test)\.(js|ts)$/;

export const testCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getServeOptions(project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths, allImports] = await Logger.execute('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadImports(project), loadProviders(project)]);
  });

  options.imports = allImports;
  options.test = true;

  const emulators = await Logger.execute('🔄️ Loading emulators', () => {
    const { metadata } = buildMetadata(project.sourceFiles, {
      aliasPaths
    });

    return getServiceEmulators(metadata, options);
  });

  const workingDirectory = process.cwd();
  const filePatterns = input.arguments;

  const testFiles = await Logger.execute('🧪 Running tests', async () => {
    Tester.configure(emulators, options);

    await prepareServices(emulators);

    await bootstrapServices(emulators);

    const allFiles = await readdir(workingDirectory, {
      recursive: true
    });

    return allFiles.filter((file) => {
      if (TestFilePattern.test(file)) {
        return !filePatterns || filePatterns.some((filePattern) => file.includes(filePattern));
      }

      return false;
    });
  });

  for (const testFile of testFiles) {
    await import(join(workingDirectory, testFile));
  }

  await once(run(), 'end');

  await shutdownServices(emulators);
};
