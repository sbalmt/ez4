import type { ExtraSource } from '@ez4/project/library';
import { getEntry, type EntryStates } from '@ez4/stateful';

import { reflectionFiles } from '@ez4/reflection';

import { build, formatMessages } from 'esbuild';

import { dirname, join, parse, relative } from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';

import { SourceFileError } from '../errors/bundler.js';
import { Logger } from './logger.js';

const filesCache = new Map<string, string>();

export type BundleOptions = {
  sourceFile: string;
  wrapperFile: string;
  handlerName: string;
  filePrefix: string;
  extras?: Record<string, ExtraSource>;
  define?: Record<string, string>;
};

export const bundleHash = async (sourceFile: string) => {
  const basePath = join(process.cwd(), sourceFile);
  const sourceFiles = reflectionFiles([sourceFile]);
  const version = createHash('sha256');

  for (const filePath of sourceFiles) {
    const fileStat = await stat(filePath);

    const relativePath = relative(basePath, filePath);
    const lastModified = fileStat.mtime.getTime();

    version.update(`${relativePath}:${lastModified}`);
  }

  return version.digest('hex');
};

export const bundleFunction = async (
  serviceName: string,
  state: EntryStates,
  options: BundleOptions
) => {
  const { sourceFile, handlerName } = options;

  const cacheKey = `${sourceFile}:${handlerName}`;
  const cacheFile = filesCache.get(cacheKey);

  if (cacheFile && existsSync(cacheFile)) {
    return cacheFile;
  }

  const sourceName = parse(options.sourceFile).name;

  const targetPath = dirname(options.sourceFile);
  const targetFile = `${options.filePrefix}.${sourceName}.${options.handlerName}.mjs`;

  const outputFile = join('.ez4/tmp', targetPath, targetFile);

  const [contents, definitions] = await getEntrypointCode(state, options);

  const result = await build({
    bundle: true,
    minify: true,
    lineLimit: 80,
    treeShaking: true,
    outfile: outputFile,
    packages: 'bundle',
    platform: 'node',
    target: 'node20',
    format: 'esm',
    define: {
      ...definitions,
      ...options.define
    },
    stdin: {
      loader: 'ts',
      sourcefile: 'wrapper.ts',
      resolveDir: process.cwd(),
      contents
    },
    banner: {
      js: getCompatibilityCode()
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
    Logger.logWarning(serviceName, message);
  });

  errors.forEach((message) => {
    Logger.logError(serviceName, message);
  });

  if (errors.length) {
    throw new SourceFileError(sourceFile);
  }

  filesCache.set(cacheKey, outputFile);

  return outputFile;
};

const getCompatibilityCode = () => {
  return `
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire as topLevelCreateRequire } from 'module';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = topLevelCreateRequire(import.meta.url);
`;
};

const getEntrypointCode = async (
  state: EntryStates,
  options: BundleOptions
): Promise<[string, Record<string, string>]> => {
  const wrapper = await readFile(options.wrapperFile);
  const context = getExtraContext(state, options.extras ?? {});

  return [
    `
import { ${options.handlerName} as next } from './${options.sourceFile}';
${context.packages}

const __EZ4_CONTEXT = ${context.services};

${wrapper}
`,
    context.definitions
  ];
};

const getExtraContext = (state: EntryStates, extras: Record<string, ExtraSource>) => {
  const packages: string[] = [];
  const services: string[] = [];

  const definitions: Record<string, string> = {};

  for (const contextName in extras) {
    const { constructor, module, from, entryStateId } = extras[contextName];

    const service = `${contextName}${module}`;

    packages.push(`import { ${module} as ${service} } from '${from}';`);
    services.push(`${contextName}: ${service}.${constructor}`);

    if (!entryStateId) {
      continue;
    }

    const { result } = getEntry(state, entryStateId);

    if (result) {
      for (const key in result) {
        const value = (result as Record<string, any>)[key];

        definitions[`__EZ4_OUTPUT('${entryStateId}:${key}')`] = `${value}`;
      }
    }
  }

  return {
    packages: packages.join('\n'),
    services: `{${services.join(',\n')}}`,
    definitions
  };
};
