export class MissingEntryResourceError extends Error {
  constructor(
    public entryType: string,
    public entryId: string
  ) {
    super(`Entry ${entryId} for ${entryType} resource is missing.`);
  }
}
