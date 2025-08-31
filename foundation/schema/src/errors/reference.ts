export class SchemaReferenceNotFound extends Error {
  constructor(public path: string) {
    super(`Schema reference ${path} was not found.`);
  }
}
