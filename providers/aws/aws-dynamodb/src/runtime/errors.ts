import { ServiceError } from '@ez4/common';

export class MalformedRequestError extends ServiceError {
  constructor(details: string[]) {
    super('Malformed table schema.', details);
  }
}
