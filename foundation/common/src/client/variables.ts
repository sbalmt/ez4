import { isAnyString } from '@ez4/utils';

export namespace VariablesClient {
  export const make = (variables: Readonly<Record<string, string | undefined>> = process.env) => {
    return new Proxy<Record<string, string>>(
      {},
      {
        get: (_, property) => {
          if (isAnyString(property) && property in variables) {
            return variables[property];
          }

          if (property !== 'then') {
            throw new Error(`Environment variable '${property.toString()}' is not found.`);
          }

          return undefined;
        }
      }
    );
  };
}
