export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for SNS is missing.`);
  }
}

export class SubscriptionMissingError extends Error {
  constructor(public subscriptionName: string) {
    super(`Subscription service ${subscriptionName} wasn't found.`);
  }
}

export class ProjectMissingError extends Error {
  constructor(public projectName: string) {
    super(`Imported project ${projectName} wasn't found.`);
  }
}
