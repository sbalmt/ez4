import type { AnyObject } from '@ez4/utils';

import { isAnyString } from '@ez4/utils';

export namespace Client {
  export const make = () => {
    return new Proxy<AnyObject>(
      {},
      {
        get: (_, property) => {
          if (property === 'then') {
            return undefined;
          }

          if (!isAnyString(property) || !(property in process.env)) {
            throw new Error(`Environment variable '${property.toString()}' not found.`);
          }

          return process.env[property];
        }
      }
    );
  };
}
