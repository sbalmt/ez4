export class ServiceError extends Error {
  constructor(
    message: string,
    public details?: string[]
  ) {
    super(message);
  }
}
