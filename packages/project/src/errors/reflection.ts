export class ReflectionSourceFileNotFound extends Error {
  constructor(public sourceFile: string) {
    super(`Source file ${sourceFile} for reflection was not found.`);
  }
}
