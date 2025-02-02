export class MalformedMessageError extends Error {
  constructor(public details: string[]) {
    super(`Malformed notification message body.`);
  }
}
