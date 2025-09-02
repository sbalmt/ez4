export namespace Boolean {
  export type Default<Value extends boolean> = {
    '@ez4/schema': 'boolean';
    default: Value;
  };
}
