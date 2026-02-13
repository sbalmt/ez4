import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';
import { Tester } from '@ez4/project/library';

import { buildMetadata } from '../../library/metadata';
import { warnUnsupportedFlags } from '../../utils/flags';
import { getServiceEmulators } from '../../emulator/service';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/utils/hooks';
import { getServeOptions } from '../../emulator/options';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProviders } from '../../config/providers';
import { loadImports } from '../../config/imports';

import { join } from 'node:path';
import { readdir } from 'node:fs/promises';
import { spec } from 'node:test/reporters';
import { run } from 'node:test';

const TestFilePattern = /\.(spec|test)\.(js|ts)$/;

export const testCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getServeOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths, allImports] = await DynamicLogger.logExecution('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadImports(project), loadProviders(project)]);
  });

  warnUnsupportedFlags(input, {
    arguments: true,
    inspect: true,
    coverage: true,
    reset: options.local,
    local: true
  });

  options.imports = allImports;
  options.suppress = true;
  options.test = true;

  const emulators = await DynamicLogger.logExecution('🔄️ Loading emulators', () => {
    const { metadata } = buildMetadata(project.sourceFiles, {
      aliasPaths
    });

    return getServiceEmulators(metadata, options);
  });

  const workingDirectory = process.cwd();
  const filePatterns = input.arguments;

  const testFiles = await DynamicLogger.logExecution('🧪 Running tests', async () => {
    Tester.configure(emulators, options);

    await prepareServices(emulators);

    await bootstrapServices(emulators);

    const allFiles = await readdir(workingDirectory, {
      recursive: true
    });

    const testFiles = allFiles.filter((file) => {
      if (TestFilePattern.test(file)) {
        return !filePatterns || filePatterns.some((filePattern) => file.includes(filePattern));
      }

      return false;
    });

    return testFiles.map((testFile) => {
      return join(workingDirectory, testFile);
    });
  });

  const testRunner = run({
    coverage: input.coverage,
    coverageIncludeGlobs: [`${workingDirectory}/**/*`],
    isolation: 'none',
    files: testFiles,
    forceExit: true
  });

  testRunner.compose(spec).pipe(process.stdout);

  let testCount = 0;

  // Ensure an active service won't hold the tests.
  testRunner.on('test:complete', ({ details }) => {
    if (details.type === 'suite' && ++testCount >= testFiles.length) {
      shutdownServices(emulators);
    }
  });
};
