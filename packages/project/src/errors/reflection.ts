export class ReflectionSourceFileNotFound extends Error {
  constructor(public sourceFile: string) {
    super(`Reflection source file ${sourceFile} was not found.`);
  }
}
