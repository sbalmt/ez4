import type { ExtraSource } from '@ez4/project/library';

import { build, formatMessages } from 'esbuild';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, parse } from 'node:path';
import { existsSync } from 'node:fs';

import { getTemporaryPath } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { SourceFileError } from '../errors/bundler';
import { Logger } from './logger';

const fileCache = new Map<string, string>();
const hashCache = new Map<string, string>();
const pathCache = new Map<string, string>();

export type BundlerEntrypoint = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type BundlerOptions = {
  filePrefix: string;
  templateFile: string;
  handler: BundlerEntrypoint;
  listener?: BundlerEntrypoint | null;
  extras?: Record<string, ExtraSource>;
  define?: Record<string, string>;
  debug?: boolean;
};

export const createBundleHash = async (allSourceFiles: string[]) => {
  const fileSignatures = createHash('sha256');

  const pathSignatures = await Promise.all(
    allSourceFiles.map(async (filePath) => {
      let pathSignature = pathCache.get(filePath);

      if (!pathSignature) {
        const fileStat = await stat(filePath);
        const modified = fileStat.mtime.getTime();

        pathSignature = `${filePath}:${modified}`;

        pathCache.set(filePath, pathSignature);
      }

      return {
        filePath,
        pathSignature
      };
    })
  );

  // Ensure same position to not trigger updates without real changes.
  pathSignatures.sort((a, b) => a.filePath.localeCompare(b.filePath));

  for (const { pathSignature } of pathSignatures) {
    fileSignatures.update(pathSignature);
  }

  return fileSignatures.digest('hex');
};

export const getBundleHash = async (sourceFile: string, dependencyFiles: string[]) => {
  let bundleHash = hashCache.get(sourceFile);

  if (!bundleHash) {
    bundleHash = await createBundleHash(dependencyFiles);

    hashCache.set(sourceFile, bundleHash);
  }

  return bundleHash;
};

export const getFunctionBundle = async (serviceName: string, options: BundlerOptions) => {
  const { sourceFile, functionName } = options.handler;

  const cacheKey = `${sourceFile}:${functionName}`;
  const cacheFile = fileCache.get(cacheKey);

  if (cacheFile && existsSync(cacheFile)) {
    return cacheFile;
  }

  const { filePrefix, debug } = options;

  const { dir: targetPath, name: targetName } = parse(sourceFile);

  const targetFile = join(targetPath, `${filePrefix}.${targetName}.${toKebabCase(functionName)}.mjs`);
  const outputFile = getTemporaryPath(targetFile);

  const result = await build({
    outfile: outputFile,
    treeShaking: !debug,
    minify: !debug,
    packages: 'bundle',
    platform: 'node',
    target: 'node22',
    format: 'esm',
    external: ['@aws-sdk/*'],
    keepNames: true,
    bundle: true,
    define: {
      ...options.define
    },
    stdin: {
      resolveDir: process.cwd(),
      contents: await getEntrypointCode(options),
      sourcefile: 'main.ts',
      loader: 'ts'
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

  fileCache.set(cacheKey, outputFile);

  return outputFile;
};

const getCompatibilityCode = () => {
  return `
import { createRequire as __EZ4_CREATE_REQUIRE } from 'node:module';
import { fileURLToPath as __EZ4_FILE_URL_TO_PATH } from 'node:url';
import { dirname as __EZ4_DIRNAME } from 'node:path';

const require = __EZ4_CREATE_REQUIRE(import.meta.url);

const __filename = __EZ4_FILE_URL_TO_PATH(import.meta.url);
const __dirname = __EZ4_DIRNAME(__filename);
`;
};

const getEntrypointCode = async (options: BundlerOptions) => {
  const template = await readFile(options.templateFile);
  const context = getExtraContext(options.extras ?? {});

  const { handler, listener } = options;

  return `
import { ${handler.functionName} as handle } from '${getEntrypointImport(handler)}';
${listener ? `import { ${listener.functionName} as dispatch } from '${getEntrypointImport(listener)}'` : `const dispatch = () => {}`};
${context.packages}

const __EZ4_CONTEXT = ${context.services};

${template}
`;
};

const getEntrypointImport = (entrypoint: BundlerEntrypoint) => {
  return entrypoint.module ?? `./${entrypoint.sourceFile}`;
};

const getExtraContext = (extras: Record<string, ExtraSource>) => {
  const packages: string[] = [];
  const services: string[] = [];

  for (const contextName in extras) {
    const { constructor, module, from } = extras[contextName];

    const service = `${contextName}${module}`;

    packages.push(`import { ${module} as ${service} } from '${from}';`);
    services.push(`${contextName}: ${service}.${constructor}`);
  }

  return {
    packages: packages.join('\n'),
    services: `{${services.join(',\n')}}`
  };
};
