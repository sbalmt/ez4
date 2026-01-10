/**
 * Generic service error context.
 */
export type ServiceErrorContext = {
  [name: string]: unknown;
};

/**
 * Generic service error with context.
 *
 * @param message Error message.
 * @param context Error context.
 */
export class ServiceError<T extends ServiceErrorContext = ServiceErrorContext> extends Error {
  constructor(
    message: string,
    public context?: T
  ) {
    super(message);
  }
}
