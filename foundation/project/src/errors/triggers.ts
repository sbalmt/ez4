export class DuplicateTriggerError extends Error {
  constructor(public triggerName: string) {
    super(`Trigger ${triggerName} is already registered.`);
  }
}
