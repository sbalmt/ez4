import type { BundlerEntrypoint, BundlerOptions } from '../types/bundler';

import { dirname, parse, relative, resolve } from 'node:path';
import { availableParallelism } from 'node:os';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

import { build, formatMessages } from 'esbuild';

import { getTemporaryPath } from '@ez4/project/library';
import { Tasks, toKebabCase } from '@ez4/utils';
import { Logger } from '@ez4/logger';

import { getCompatibilityCode, getEntrypointCode, getEntrypointPlugin } from '../utils/entrypoint';
import { SourceFileError } from '../errors/bundler';

const AVAILABLE_CPUS = Math.max(1, Math.floor(availableParallelism() / 2));

const FILES_CACHE = new Map<string, string>();

const BUNDLE_QUEUE = new Tasks.Queue({
  concurrency: AVAILABLE_CPUS
});

export const clearBundleCache = () => {
  FILES_CACHE.clear();
};

export const getFunctionBundle = (provider: string, options: BundlerOptions) => {
  return BUNDLE_QUEUE.run(() => getBundleFile(provider, options));
};

const getEntrypointKey = ({ sourceFile, functionName, module }: BundlerEntrypoint) => {
  return {
    sourceFile,
    functionName,
    module
  };
};

const getCacheKey = (workspacePath: string, { entrypointFile, handler, middlewares, listener }: BundlerOptions) => {
  return JSON.stringify({
    handler: getEntrypointKey(handler),
    middlewares: middlewares?.map(getEntrypointKey),
    listener: listener && getEntrypointKey(listener),
    entrypointFile,
    workspacePath
  });
};

const getBundleFile = async (provider: string, options: BundlerOptions) => {
  const workspacePath = resolve(options.workspacePath ?? process.cwd());

  const { sourceFile, functionName } = options.handler;

  const cacheKey = getCacheKey(workspacePath, options);

  const cacheFile = FILES_CACHE.get(cacheKey);

  if (cacheFile && existsSync(cacheFile)) {
    return cacheFile;
  }

  const { dir: targetPath, name: targetName } = parse(sourceFile);
  const { projectName, projectPrefix, projectBranch } = options;
  const { resourceName, filePrefix, target, debug } = options;

  const handlerName = toKebabCase(functionName);

  const targetFile = resolve(workspacePath, targetPath, `${filePrefix}.${targetName}.${handlerName}.mjs`);
  const outputFile = getTemporaryPath(workspacePath, relative(workspacePath, targetFile));

  await mkdir(dirname(outputFile), { recursive: true });

  const entrypointFile = options.entrypointFile && resolve(workspacePath, options.entrypointFile);

  const result = await build({
    outfile: outputFile,
    treeShaking: !debug,
    minifyWhitespace: true,
    minifySyntax: true,
    keepNames: true,
    bundle: true,
    platform: 'node',
    packages: 'bundle',
    external: ['@aws-sdk/*'],
    format: 'esm',
    target,
    banner: {
      js: getCompatibilityCode()
    },
    ...(entrypointFile
      ? {
          entryPoints: [entrypointFile],
          plugins: [await getEntrypointPlugin(options, workspacePath)]
        }
      : {
          stdin: {
            resolveDir: workspacePath,
            contents: await getEntrypointCode(options),
            sourcefile: 'main.ts',
            loader: 'ts'
          }
        }),
    define: {
      ...options.define,
      EZ4_RESOURCE_NAME: `'${resourceName}'`,
      EZ4_PROJECT_BRANCH: JSON.stringify(projectBranch),
      EZ4_PROJECT_PREFIX: JSON.stringify(projectPrefix),
      EZ4_PROJECT_NAME: JSON.stringify(projectName),
      EZ4_IS_DEBUG_RUNTIME: `${!!debug}`,
      EZ4_IS_REMOTE_RUNTIME: 'true'
    }
  });

  const [errors, warnings] = await Promise.all([
    formatMessages(result.errors, {
      kind: 'error',
      color: false
    }),
    formatMessages(result.warnings, {
      kind: 'warning',
      color: false
    })
  ]);

  warnings.forEach((message) => {
    Logger.warn(`[${provider}]: ${message}`);
  });

  errors.forEach((message) => {
    Logger.error(`[${provider}]: ${message}`);
  });

  if (errors.length) {
    throw new SourceFileError(sourceFile);
  }

  FILES_CACHE.set(cacheKey, outputFile);

  return outputFile;
};
