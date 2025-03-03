export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for EventBridge Scheduler is missing.`);
  }
}

export class TargetHandlerMissingError extends Error {
  constructor(public handlerName: string) {
    super(`Target handler ${handlerName} wasn't found.`);
  }
}
