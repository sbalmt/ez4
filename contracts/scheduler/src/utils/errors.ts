import { ServiceError } from '@ez4/common';

export class MalformedEventError extends ServiceError {
  constructor(details: string[]) {
    super(`Malformed scheduler event payload.`, { details });
  }
}
