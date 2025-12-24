export namespace Validator {
  export type Use<Type extends { schema: unknown }> = {
    '@ez4/schema': 'custom';
    type: Type['schema'];
  };
}
