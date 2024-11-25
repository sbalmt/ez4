export class RoleMissing extends Error {
  constructor() {
    super(`Execution role for SQS is missing.`);
  }
}

export class ProjectMissing extends Error {
  constructor(public projectName: string) {
    super(`Imported project ${projectName} wasn't found.`);
  }
}
