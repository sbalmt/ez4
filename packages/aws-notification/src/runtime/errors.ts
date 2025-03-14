export class MalformedMessageError extends Error {
  constructor(public details: string[]) {
    super(`Malformed topic message body.`);
  }
}

export class MissingMessageGroupError extends Error {
  constructor(public fieldName: string) {
    super(`Message group for the topic field ${fieldName} is missing.`);
  }
}
