import type { ErrorDetails } from '@ez4/validator';

import { ServiceError } from '@ez4/common';

export class MalformedRequestError extends ServiceError {
  constructor(details: ErrorDetails[]) {
    super('Malformed table schema.', { details });
  }
}
