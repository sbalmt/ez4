export class HandlerTimeoutError extends Error {
  constructor() {
    super('Handler timed out before any response.');
  }
}
