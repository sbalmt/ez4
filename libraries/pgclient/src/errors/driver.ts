export class UnsupportedFieldTypeError extends Error {
  constructor(
    public field: string,
    public type: string
  ) {
    super(`Type '${type}' for field '${field}' isn't supported.`);
  }
}

export class DuplicateUniqueKeyError extends Error {
  constructor() {
    super(`Duplicate key for table was detected.`);
  }
}
