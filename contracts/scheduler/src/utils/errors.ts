import type { ErrorDetails } from '@ez4/validator';

import { ServiceError } from '@ez4/common';

export class MalformedEventError extends ServiceError {
  constructor(details: ErrorDetails[]) {
    super(`Malformed scheduler event payload.`, { details });
  }
}
