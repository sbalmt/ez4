/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'hello-raw-redis',
  sourceFiles: ['./src/api.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  deployOptions: {
    release: {
      tagName: 'ReleaseVersion',
      variableName: 'RELEASE_VERSION',
      version: '1.0.0'
    }
  },
  localOptions: {
    // Service name `CacheService` → snake_case key `cache_service`.
    // Without these options, the same env vars used by the deploy are read.
    cache_service: {
      url: process.env.EZ4_RAW_REDIS_CACHE_SERVICE_URL ?? 'redis://127.0.0.1:6379',
      token: process.env.EZ4_RAW_REDIS_CACHE_SERVICE_TOKEN
    }
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
