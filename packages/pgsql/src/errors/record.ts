export class MissingRecordError extends Error {
  constructor() {
    super(`Record is missing for the statement.`);
  }
}
