import { MissingPackageError } from '../common/errors';

export class NoGeneratorFoundError extends MissingPackageError {
  constructor(parameters: string[]) {
    super(`No resource generator found for the given parameters: ${parameters.join(', ')}`);
  }
}
