export class MissingProjectError extends Error {
  constructor(public fileName: string) {
    super(`No project was exported from ${fileName} file.`);
  }
}

export class MissingImportedProjectError extends Error {
  constructor(public projectName: string) {
    super(`Imported project ${projectName} wasn't found.`);
  }
}
