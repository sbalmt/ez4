import type { AnyObject } from '@ez4/utils';

import { isAnyString } from '@ez4/utils';

export namespace OptionsClient {
  export const make = (options: AnyObject) => {
    return new Proxy<Record<string, string>>(
      {},
      {
        get: (_, property) => {
          if (isAnyString(property) && property in options) {
            return options[property];
          }

          return undefined;
        }
      }
    );
  };
}
