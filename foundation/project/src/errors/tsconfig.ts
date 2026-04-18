export class MissingTsConfigFileError extends Error {
  constructor(public projectFile: string) {
    super(`TypeScript config file ${projectFile} wasn't found.`);
  }
}
