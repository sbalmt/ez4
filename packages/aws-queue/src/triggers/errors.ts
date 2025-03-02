export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for SQS is missing.`);
  }
}

export class SubscriptionHandlerMissingError extends Error {
  constructor(public handlerName: string) {
    super(`Subscription handler ${handlerName} wasn't found.`);
  }
}

export class ProjectMissingError extends Error {
  constructor(public projectName: string) {
    super(`Imported project ${projectName} wasn't found.`);
  }
}
