import { build, formatMessages } from 'esbuild';

if (!import.meta.dirname) {
  console.error(`Something went wrong, ensure your node is v20+`);
  process.exit(1);
}

const esmDefinitions = {
  __MODULE_PATH: 'import.meta.dirname'
};

const cjsDefinitions = {
  __MODULE_PATH: '__dirname'
};

export const bundlePackage = async (entryFile, outFile, format, target = 'node22') => {
  const result = await build({
    treeShaking: true,
    keepNames: true,
    minify: true,
    bundle: true,
    lineLimit: 80,
    entryPoints: [entryFile],
    outfile: outFile,
    packages: 'external',
    platform: 'node',
    sourcemap: 'linked',
    target,
    format,
    define: {
      ...(format === 'esm' && esmDefinitions),
      ...(format === 'cjs' && cjsDefinitions)
    }
  });

  const [warnings, errors] = await Promise.all([
    formatMessages(result.warnings, {
      kind: 'warning',
      color: true
    }),
    formatMessages(result.errors, {
      kind: 'error',
      color: true
    })
  ]);

  warnings.forEach((message) => {
    console.warn(message);
  });

  errors.forEach((message) => {
    console.error(message);
  });

  if (result.errors.length) {
    process.exit(1);
  }
};
