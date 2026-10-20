import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createModule } from '@ez4/emulator';

describe('factory worker (environment variables)', () => {
  it('assert :: injects factory and nested dependency variables into a local handler', async () => {
    const environment = { ...process.env };

    const module = createModule({
      environment: {
        timeout: 3,
        memory: 32,
        variables: {
          EZ4_FACTORY_VALUE: 'project-value'
        }
      },
      handler: {
        file: 'test/files/handlers.ts',
        name: 'invokeVariables',
        position: [1, 1]
      },
      invoker: {
        file: 'test/files/invoker.ts',
        name: 'makeInvoker'
      },
      services: {
        variables: {
          module: '@ez4/common/worker',
          name: 'makeVariables'
        },
        factory: {
          module: '@ez4/factory/worker',
          name: 'makeService',
          variables: {
            EZ4_FACTORY_VALUE: 'first',
            EZ4_FACTORY_ALIAS: 'alias-value',
            EZ4_FACTORY_DEFAULT: 'default-value'
          },
          options: {
            handler: {
              file: 'test/cases/variables.ts',
              name: 'createVariablesFirst'
            },
            references: {
              variables: 'variables',
              dependency: 'dependency'
            }
          }
        },
        dependency: {
          module: '@ez4/factory/worker',
          name: 'makeService',
          variables: {
            EZ4_FACTORY_DEPENDENCY: 'dependency'
          },
          options: {
            handler: {
              file: 'test/cases/variables.ts',
              name: 'createVariablesDependency'
            },
            references: {
              variables: 'variables'
            }
          }
        }
      },
      references: {
        factory: 'factory'
      }
    });

    deepEqual(await module.invoke({}), {
      value: 'first',
      alias: 'alias-value',
      fallback: 'default-value',
      dependency: 'dependency'
    });

    deepEqual({ ...process.env }, environment);
  });
});
