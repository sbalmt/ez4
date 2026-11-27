# EZ4: Custom gateway entrypoint

This provider generates API Gateway entrypoints exported as `requestEntrypoint`, `messageEntrypoint`, `connectionEntrypoint`, and `authorizerEntrypoint`.

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

export const requestEntrypoint = async (...args) => {
  const { requestEntrypoint } = await loadEntrypoint();

  return requestEntrypoint(...args);
};

export const messageEntrypoint = async (...args) => {
  const { messageEntrypoint } = await loadEntrypoint();

  return messageEntrypoint(...args);
};

export const connectionEntrypoint = async (...args) => {
  const { connectionEntrypoint } = await loadEntrypoint();

  return connectionEntrypoint(...args);
};

export const authorizerEntrypoint = async (...args) => {
  const { authorizerEntrypoint } = await loadEntrypoint();

  return authorizerEntrypoint(...args);
};
```

The dynamic import is required when instrumentation must initialize before the provider's dependencies are evaluated. Without it, static ESM imports can evaluate the generated entrypoint before initialization code runs.
