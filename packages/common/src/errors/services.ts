import { InvalidTypeError, TypeError } from './common.js';

export class MissingServiceProviderError extends TypeError {
  constructor(
    public serviceName: string,
    fileName?: string
  ) {
    super(`No provider for service ${serviceName} was found.`, fileName);
  }
}

export class MissingServiceError extends TypeError {
  constructor(
    public serviceName: string,
    fileName?: string
  ) {
    super(`Service ${serviceName} is not defined or missing.`, fileName);
  }
}

export class InvalidServiceError extends InvalidTypeError {
  constructor(
    public serviceName: string,
    fileName?: string
  ) {
    super(`Invalid service`, serviceName, undefined, fileName);
  }
}
