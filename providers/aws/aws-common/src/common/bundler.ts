import type { LinkedContext } from '@ez4/project/library';

import { build, formatMessages } from 'esbuild';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, parse } from 'node:path';
import { existsSync } from 'node:fs';
import { cpus } from 'node:os';

import { arrayUnique, hashData, isNullish, toKebabCase, toPascalCase, toSnakeCase } from '@ez4/utils';
import { getTemporaryPath } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

import { SourceFileError } from '../errors/bundler';

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
  listener?: BundlerEntrypoint;
  context?: Record<string, LinkedContext>;
  define?: Record<string, string>;
  debug?: boolean;
  target?: string;
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

  // Ensure the same position to not trigger updates without real changes.
  pathSignatures.sort((a, b) => a.filePath.localeCompare(b.filePath));

  for (const { pathSignature } of pathSignatures) {
    fileSignatures.update(pathSignature);
  }

  return fileSignatures.digest('hex');
};

export const getBundleHash = async (sourceFile: string, dependencyFiles: string[]) => {
  let bundleHash = hashCache.get(sourceFile);

  if (!bundleHash) {
    bundleHash = await createBundleHash(arrayUnique(dependencyFiles));

    hashCache.set(sourceFile, bundleHash);
  }

  return bundleHash;
};

const maxTokens = Math.max(1, Math.floor(cpus().length / 2));

const scheduleQueue: {
  serviceName: string;
  options: BundlerOptions;
  resolve: (outputFile: string) => void;
  reject: (reason?: any) => void;
}[] = [];

let activeTokens = 0;

export const getFunctionBundle = async (serviceName: string, options: BundlerOptions) => {
  if (activeTokens < maxTokens) {
    try {
      activeTokens++;
      return await buildFunctionBundle(serviceName, options);
    } finally {
      activeTokens--;

      const next = scheduleQueue.shift();

      if (next) {
        const { serviceName, options, resolve, reject } = next;

        getFunctionBundle(serviceName, options).then(resolve).catch(reject);
      }
    }
  }

  return new Promise<string>((resolve, reject) => {
    scheduleQueue.push({
      serviceName,
      options,
      resolve,
      reject
    });
  });
};

export const buildFunctionBundle = async (serviceName: string, options: BundlerOptions) => {
  const { sourceFile, functionName } = options.handler;

  const cacheKey = `${sourceFile}:${functionName}`;
  const cacheFile = fileCache.get(cacheKey);

  if (cacheFile && existsSync(cacheFile)) {
    return cacheFile;
  }

  const { dir: targetPath, name: targetName } = parse(sourceFile);
  const { filePrefix, target, debug } = options;

  const targetFile = join(targetPath, `${filePrefix}.${targetName}.${toKebabCase(functionName)}.mjs`);
  const outputFile = getTemporaryPath(targetFile);

  const result = await build({
    outfile: outputFile,
    treeShaking: !debug,
    minifyWhitespace: true,
    minifySyntax: true,
    platform: 'node',
    packages: 'bundle',
    format: 'esm',
    external: ['@aws-sdk/*'],
    keepNames: true,
    bundle: true,
    target,
    define: {
      ...options.define,
      EZ4_IS_REMOTE_RUNTIME: 'true'
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
    Logger.warn(`[${serviceName}]: ${message}`);
  });

  errors.forEach((message) => {
    Logger.error(`[${serviceName}]: ${message}`);
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
  const context = buildServiceContext(options.context ?? {});

  const { handler, listener } = options;

  return `
import { ${handler.functionName} as handle } from '${getEntrypointImport(handler)}';
${listener ? `import { ${listener.functionName} as dispatch } from '${getEntrypointImport(listener)}'` : `const dispatch = () => {}`};
${context.packages.join('\n')}

const __EZ4_MAKE_LAZY_CONTEXT_FACTORY = (context)=> {
  return new Proxy(context, {
    get: (target, property) => {
      if (typeof property !== 'string' || !(property in target)) {
        throw new Error(\`Context service '\${property.toString()}' not found.\`);
      }

      if (target[property] instanceof Function) {
        target[property] = target[property]();
      }

      return target[property];
    }
  });
}

const __EZ4_REPOSITORY = ${context.repository};
const __EZ4_CONTEXT = ${context.services};

${template}
`;
};

const getEntrypointImport = (entrypoint: BundlerEntrypoint) => {
  return entrypoint.module ?? `./${entrypoint.sourceFile}`;
};

const buildServiceContext = (linkedContext: Record<string, LinkedContext>) => {
  const repository: Record<string, string> = {};
  const packages: string[] = [];

  const buildContext = (linkedContext: Record<string, LinkedContext>) => {
    const services: string[] = [];

    for (const property of Object.keys(linkedContext).sort()) {
      const { constructor, module, from, context } = linkedContext[property];

      const constructorName = toPascalCase(`${property}${module}`);

      const constructorCode = applyTemplateVariables(constructor, {
        EZ4_MODULE_CONTEXT: context && buildContext(context),
        EZ4_MODULE_IMPORT: constructorName
      });

      const constructorHash = `__EZ4_${toSnakeCase(hashData(constructorCode)).toUpperCase()}`;

      if (!(constructorHash in repository)) {
        packages.push(`import { ${module} as ${constructorName} } from '${from}';`);

        repository[constructorHash] = constructorCode;
      }

      services.push(`['${property}']: __EZ4_REPOSITORY.${constructorHash}`);
    }

    return `__EZ4_MAKE_LAZY_CONTEXT_FACTORY({${services.join(',')}})`;
  };

  const services = buildContext(linkedContext);

  const factory = Object.entries(repository).map(([property, service]) => `['${property}']: () => ${service}`);

  return {
    repository: `{${factory.join(',')}}`,
    packages,
    services
  };
};

const applyTemplateVariables = (constructor: string, variables: Record<string, string | undefined>) => {
  return constructor.replaceAll(/@\{([\w_]+)\}/g, (_, variableName) => {
    if (!(variableName in variables) || isNullish(variables[variableName])) {
      throw new Error(`Template variable ${variableName} isn't expected.`);
    }

    return variables[variableName];
  });
};
