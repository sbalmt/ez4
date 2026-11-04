export class UnsupportedFieldTypeError extends Error {
  constructor(
    public field: string,
    public type: string
  ) {
    super(`Type '${type}' for field '${field}' isn't supported.`);
  }
}

export class DuplicateUniqueKeyError extends Error {
  constructor(cause?: Error) {
    super(cause?.message ?? `Duplicate key for table was detected.`, { cause });
  }
}
