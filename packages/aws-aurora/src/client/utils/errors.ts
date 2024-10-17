export class MalformedRequestError extends Error {
  constructor(public details: string[]) {
    super(`Malformed table schema.`);
  }
}
