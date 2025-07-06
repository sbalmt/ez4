export class SourceFileError extends Error {
  constructor(public sourceFile: string) {
    super(`Unable to bundle ${sourceFile} due to source file errors.`);
  }
}
