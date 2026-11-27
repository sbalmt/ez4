# EZ4: Custom gateway entrypoint

This provider generates API Gateway entrypoints exported as `httpRequestEntrypoint`, `wsMessageEntrypoint`, `wsConnectionEntrypoint`, and `authorizerEntrypoint`.

> Custom entrypoint wrappers should be reserved for code that must initialize before any provider or application code, such as observability instrumentation. For most lifecycle or request processing, prefer [listeners](../../../../documentation/listeners.md) and [middlewares](../../../../documentation/middlewares.md).

Configure one wrapper for the project in `ez4.project.js`:

```ts
export default {
  // ...other project options
  bundleOptions: {
    entrypointFile: './src/entrypoint.ts'
  }
};
```

Initialize instrumentation and dynamically import the generated entrypoint from the wrapper:

```ts
import './observability.ts';

const loadEntrypoint = () => import('ez4:entrypoint');

export const httpRequestEntrypoint = async (...args) => {
  const { httpRequestEntrypoint } = await loadEntrypoint();

  return httpRequestEntrypoint(...args);
};

export const wsMessageEntrypoint = async (...args) => {
  const { wsMessageEntrypoint } = await loadEntrypoint();

  return wsMessageEntrypoint(...args);
};

export const wsConnectionEntrypoint = async (...args) => {
  const { wsConnectionEntrypoint } = await loadEntrypoint();

  return wsConnectionEntrypoint(...args);
};

export const authorizerEntrypoint = async (...args) => {
  const { authorizerEntrypoint } = await loadEntrypoint();

  return authorizerEntrypoint(...args);
};
```

The dynamic import is required when instrumentation must initialize before the provider's dependencies are evaluated. Without it, static ESM imports can evaluate the generated entrypoint before initialization code runs.
