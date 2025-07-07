export class MalformedEventError extends Error {
  constructor(public details: string[]) {
    super(`Malformed scheduler event payload.`);
  }
}
