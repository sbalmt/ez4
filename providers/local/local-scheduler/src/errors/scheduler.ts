export class EventTooOldError extends Error {
  constructor(schedulerName: string) {
    super(`Event for scheduler ${schedulerName} is too old.`);
  }
}

export class EventNotFoundError extends Error {
  constructor(schedulerName: string, identifier: string) {
    super(`Event ${identifier} not found on scheduler ${schedulerName}.`);
  }
}
