export class DateInUseError extends Error {
  constructor() {
    super(`The given date is already in use.`);
  }
}
