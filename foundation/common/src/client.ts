import type { AnyObject } from '@ez4/utils';

import { isAnyString } from '@ez4/utils';

export namespace Client {
  export const make = (repository: AnyObject, error: string) => {
    return new Proxy<Record<string, string>>(
      {},
      {
        get: (_, property) => {
          if (isAnyString(property) && property in repository) {
            return repository[property];
          }

          if (property !== 'then') {
            throw new Error(`Value '${property.toString()}' (${error}) is not found.`);
          }

          return undefined;
        }
      }
    );
  };
}
