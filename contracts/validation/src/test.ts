import type { Validation } from './services/contract';
import type { Client } from './services/client';

import { Tester } from '@ez4/project/library';

export namespace ValidationTester {
  export type MockOptions<T> = {
    handler: (input: Pick<Validation.Input<T>, 'value'>) => Promise<void> | void;
  };

  export const getClient = (resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Promise<Client>;
  };

  export const getClientMock = <T>(_resourceName: string, options?: MockOptions<T>) => {
    return new (class {
      get schema() {
        return undefined;
      }

      async validate(value: T) {
        await options?.handler({ value });
      }

      async tryValidate(value: T) {
        try {
          return (await this.validate(value), true);
        } catch {
          return false;
        }
      }
    })();
  };
}
