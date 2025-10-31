import { isAnyString } from '@ez4/utils';

export namespace Client {
  export const make = () => {
    return new Proxy(
      {},
      {
        get: (_target, property) => {
          if (!isAnyString(property) || !(property in process.env)) {
            throw new Error(`Environment variable '${property.toString()}' not found.`);
          }

          return process.env[property];
        }
      }
    );
  };
}
