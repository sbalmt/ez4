import { isAnyString } from '@ez4/utils';

export namespace Client {
  export const make = () => {
    return new Proxy<Record<string, string>>(
      {},
      {
        get: (_, property) => {
          if (isAnyString(property) && property in process.env) {
            return process.env[property];
          }

          if (property !== 'then') {
            throw new Error(`Environment variable '${property.toString()}' not found.`);
          }

          return undefined;
        }
      }
    );
  };
}
