import type { ValidationService } from '../metadata/types';

export const prepareLinkedClient = (service: ValidationService) => {
  const { handler, schema, variables, services } = service;

  return {
    module: handler.name,
    from: `./${handler.file}`,
    constructor: `
      new (class {
        async validate(value: unknown) {
          await @{EZ4_MODULE_IMPORT}({ value, schema: this.schema }, @{EZ4_MODULE_CONTEXT});
        }
        async tryValidate(value: unknown) {
          try {
            return (await this.validate(value)), true;
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
