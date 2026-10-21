export class RestCommandError extends Error {
  constructor(
    public command: string,
    public reason: string
  ) {
    super(`Redis REST command '${command}' failed: ${reason}`);
  }
}
