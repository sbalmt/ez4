import type { ErrorDetails } from '@ez4/validator';

import { ServiceError } from '@ez4/runtime';

export class MalformedEventError extends ServiceError {
  constructor(details: ErrorDetails[]) {
    super('Malformed topic event payload.', { details });
  }
}

export class MissingEventGroupError extends Error {
  constructor(public fieldName: string) {
    super(`Event group field [${fieldName}] for the topic is missing.`);
  }
}
