# EZ4: Custom topic entrypoint

This provider generates the SNS messages entrypoint exported as snsEntrypoint.

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

export const snsEntrypoint = async (...args) => {
  const { snsEntrypoint } = await loadEntrypoint();

  return snsEntrypoint(...args);
};
```

The dynamic import is required when instrumentation must initialize before the provider's dependencies are evaluated. Without it, static ESM imports can evaluate the generated entrypoint before initialization code runs.
