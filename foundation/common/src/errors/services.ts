import { InvalidTypeError, TypeError } from './common';

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

export class InvalidServicePropertyError extends TypeError {
  constructor(
    public serviceName: string,
    public propertyName: string,
    fileName?: string
  ) {
    super(`Service ${serviceName} doesn't support the '${propertyName}' property.`, fileName);
  }
}

export class DuplicateServiceError extends TypeError {
  constructor(
    public serviceName: string,
    fileName?: string
  ) {
    super(`Service ${serviceName} is duplicate.`, fileName);
  }
}

export class ExternalReferenceError extends TypeError {
  constructor(
    public serviceName: string,
    fileName?: string
  ) {
    super(`External service ${serviceName} needs to be an import.`, fileName);
  }
}
