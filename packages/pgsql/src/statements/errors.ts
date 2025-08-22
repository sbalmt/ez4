export class MissingTableNameError extends Error {
  constructor() {
    super(`Table name for the statement is missing.`);
  }
}

export class MissingRecordError extends Error {
  constructor() {
    super(`Record for the statement is missing.`);
  }
}

export class EmptyRecordError extends Error {
  constructor() {
    super(`Record for the statement is empty.`);
  }
}

export class NoColumnsError extends Error {
  constructor() {
    super(`At least one column for the statement is required.`);
  }
}
