export class MissingProjectError extends Error {
  constructor(public projectFile: string) {
    super(`No project was exported from ${projectFile} file.`);
  }
}

export class MissingProjectFileError extends Error {
  constructor(public projectFile: string) {
    super(`Project file ${projectFile} wasn't found.`);
  }
}

export class MissingImportedProjectError extends Error {
  constructor(public projectName: string) {
    super(`Imported project ${projectName} wasn't found.`);
  }
}
