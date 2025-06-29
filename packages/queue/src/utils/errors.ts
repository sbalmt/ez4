export class MalformedMessageError extends Error {
  constructor(public details: string[]) {
    super('Malformed queue message body.');
  }
}

export class MissingMessageGroupError extends Error {
  constructor(public fieldName: string) {
    super(`Message group field ${fieldName} for the queue is missing.`);
  }
}
