export class EntriesNotFoundError extends Error {
  constructor() {
    super(`No entries were given for the operation.`);
  }
}

export class EntryNotFoundError extends Error {
  constructor(public entryId: string) {
    super(`Entry ${entryId} does not exists.`);
  }
}

export class HandlerNotFoundError extends Error {
  constructor(
    public entryType: string,
    public entryId: string
  ) {
    super(`No handler found for type ${entryType}, unable to manage entry ${entryId}.`);
  }
}

export class DependencyNotFoundError extends Error {
  constructor(
    public entryId: string,
    public dependencyId: string
  ) {
    super(`Dependency ${dependencyId} linked to entry ${entryId} does not exists.`);
  }
}

export class DuplicateEntryError extends Error {
  constructor(public entryId: string) {
    super(`Entry ${entryId} already exists.`);
  }
}

export class CorruptedEntryMapError extends Error {
  constructor(
    public entryId: string,
    public mapKey: string
  ) {
    super(`Entry key '${mapKey}' doesn't match the expected entry id ${entryId}.`);
  }
}

export class CorruptedStateReferences extends Error {
  constructor(
    public expectedLength: number,
    public consumedLength: number
  ) {
    super(`Only ${consumedLength} of ${expectedLength} references were found.`);
  }
}
