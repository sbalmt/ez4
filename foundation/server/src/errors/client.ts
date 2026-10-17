export class UnavailableConnectionError extends Error {
  constructor() {
    super('Connection is not available.');
  }
}
