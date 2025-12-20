export class SchemaReferenceNotFound extends Error {
  constructor(public referencePath: string) {
    super(`Schema reference ${referencePath} was not found.`);
  }
}

export class SchemaReferenceIndexNotFound extends Error {
  constructor(
    public referencePath: string,
    public referenceIndex: string
  ) {
    super(`Index ${referenceIndex} for schema reference ${referencePath} is not a property.`);
  }
}
