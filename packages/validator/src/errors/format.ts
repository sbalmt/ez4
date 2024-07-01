export class DuplicateStringFormatError extends Error {
  constructor(public formatName: string) {
    super(`String format ${formatName} is already registered.`);
  }
}
