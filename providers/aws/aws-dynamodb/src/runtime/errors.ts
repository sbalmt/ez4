import type { ErrorDetails } from '@ez4/validator';

import { ServiceError } from '@ez4/common';

export class MalformedRequestError extends ServiceError {
  constructor(
    public field: string | undefined,
    details: ErrorDetails[]
  ) {
    if (field) {
      super(`Malformed table schema for field '${field}'.`, { details });
    } else {
      super(`Malformed table schema.`, { details });
    }
  }
}

export class InvalidFieldSchemaError extends Error {
  constructor(public field: string) {
    super(`Schema for field '${field}' is invalid.`);
  }
}

export class InvalidAtomicOperation extends Error {
  constructor(public field: string) {
    super(`Atomic operation for field '${field}' isn't supported.`);
  }
}
