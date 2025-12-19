import type { ValidationService } from '../metadata/types';

export const prepareLinkedClient = (service: ValidationService) => {
  const { handler, schema, variables, services } = service;

  return {
    module: handler.name,
    from: `./${handler.file}`,
    constructor: `
      new (class {
        async validate(input: unknown) {
          await @{EZ4_MODULE_IMPORT}(input, @{EZ4_MODULE_CONTEXT});
        }
        async tryValidate(input: unknown) {
          try {
            return (await this.validate(input)), true;
          } catch {
            return false;
          }
        }
        get schema() {
          return ${JSON.stringify(schema)};
        }
      })`,

    variables,
    services
  };
};
