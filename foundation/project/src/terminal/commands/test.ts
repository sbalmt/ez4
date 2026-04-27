import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';
import { Tester } from '@ez4/project/library';

import { buildMetadata } from '../../library/metadata';
import { warnUnsupportedFlags } from '../../utils/flags';
import { getServeOptions } from '../../emulator/options';
import { getServiceEmulators } from '../../emulator/service';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/utils/hooks';
import { loadEnvironment } from '../../config/environment';
import { loadReferences } from '../../config/references';
import { loadProviders } from '../../config/providers';
import { loadProject } from '../../config/project';
import { loadPaths } from '../../config/tsconfig';

import { join } from 'node:path';
import { readdir } from 'node:fs/promises';
import { spec } from 'node:test/reporters';
import { run } from 'node:test';

const TestFilePattern = /\.(spec|test)\.(js|ts)$/;

export const testCommand = async (input: InputOptions) => {
  const project = await loadProject(input.project);
  const options = getServeOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [paths, projectReferences] = await DynamicLogger.logExecution('⚡ Initializing', () => {
    return Promise.all([loadPaths(project), loadReferences(project), loadProviders(project)]);
  });

  if (input.environment) {
    loadEnvironment(input.environment);
  }

  warnUnsupportedFlags(input, {
    reset: options.local,
    environment: true,
    arguments: true,
    coverage: true,
    inspect: true,
    local: true
  });

  options.imports = projectReferences.imports;
  options.suppress = true;
  options.test = true;

  const emulators = await DynamicLogger.logExecution('🔄️ Loading emulators', () => {
    const { metadata } = buildMetadata(project.sourceFiles, {
      aliasPaths: {
        ...projectReferences.paths,
        ...paths
      }
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

  if (!testFiles.length) {
    Logger.warn(`One or more test files need to be specified.`);
    return;
  }

  const testRunner = run({
    coverage: input.coverage,
    coverageIncludeGlobs: [`${workingDirectory}/**/*`],
    isolation: 'none',
    files: testFiles,
    forceExit: true
  });

  testRunner.compose(spec).pipe(process.stdout);

  testRunner.on('test:summary', async ({ success }) => {
    await shutdownServices(emulators);

    if (!success) {
      process.exitCode = 1;
    }
  });
};
