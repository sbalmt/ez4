export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for EventBridge Scheduler is missing.`);
  }
}
