export class UnsupportedPaginationModeError extends Error {
  constructor(public mode: string) {
    super(`Aurora doesn't support '${mode}' pagination mode.`);
  }
}
