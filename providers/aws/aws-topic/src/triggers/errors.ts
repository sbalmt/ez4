export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for SNS is missing.`);
  }
}

export class ProjectMissingError extends Error {
  constructor(public projectName: string) {
    super(`Imported project ${projectName} wasn't found.`);
  }
}
