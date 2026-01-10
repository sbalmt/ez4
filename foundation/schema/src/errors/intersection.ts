export class InvalidSchemaIntersection extends Error {
  constructor(
    public sourceType: string,
    public targetType: string
  ) {
    super(`Invalid schema intersection between ${targetType} and ${sourceType} types.`);
  }
}
