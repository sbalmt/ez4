export class MalformedMessageError extends Error {
  constructor(public details: string[]) {
    super('Malformed notification message body.');
  }
}

export class MissingMessageGroupError extends Error {
  constructor(public fieldName: string) {
    super(`Message group field ${fieldName} for the notification is missing.`);
  }
}
