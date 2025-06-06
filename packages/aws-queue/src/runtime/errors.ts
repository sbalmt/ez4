export class MalformedMessageError extends Error {
  constructor(public details: string[]) {
    super('Malformed queue message body.');
  }
}

export class MissingMessageGroupError extends Error {
  constructor(public fieldName: string) {
    super(`Message group for the queue field ${fieldName} is missing.`);
  }
}
