export class UnsupportedFieldType extends Error {
  constructor(
    public field: string,
    public type: string
  ) {
    super(`Type '${type}' for field '${field}' isn't supported.`);
  }
}
