export class SourceFileError extends Error {
  constructor(public sourceFile: string) {
    super(`Unable to bundle ${sourceFile} due to source file errors.`);
  }
}

export class MissingEntrypointError extends Error {
  constructor(
    public sourceFile: string,
    public exportName: string
  ) {
    super(`Entrypoint ${sourceFile} must export "${exportName}".`);
  }
}
