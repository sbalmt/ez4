/**
 * Example of a custom error.
 */
export class CustomError extends Error {
  constructor(message: string) {
    super(message);
  }
}
