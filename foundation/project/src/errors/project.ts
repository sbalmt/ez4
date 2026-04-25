export class MissingProjectExportError extends Error {
  constructor(public fileName: string) {
    super(`File ${fileName} doesn't export any project.`);
  }
}

export class MissingImportedProjectError extends Error {
  constructor(public projectName: string) {
    super(`Imported project ${projectName} wasn't found.`);
  }
}

export class MissingProjectFileError extends Error {
  constructor(public projectFile: string) {
    super(`Project file ${projectFile} wasn't found.`);
  }
}

export class MalformedProjectFileError extends Error {
  constructor(
    public projectFile: string,
    public propertyNames: string[]
  ) {
    super(`Project file ${projectFile} has properties (${propertyNames.join(', ')}) missing or invalid.`);
  }
}
