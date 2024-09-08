export class MissingProjectError extends Error {
  constructor(public fileName: string) {
    super(`No project was exported from ${fileName} file.`);
  }
}
