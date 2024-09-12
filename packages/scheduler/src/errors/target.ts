import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteTargetError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete scheduler target', properties, fileName);
  }
}

export class InvalidTargetTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid scheduler target type', undefined, 'Cron.Target', fileName);
  }
}

export class IncorrectTargetTypeError extends IncorrectTypeError {
  constructor(
    public targetType: string,
    fileName?: string
  ) {
    super('Incorrect scheduler target type', targetType, 'Cron.Target', fileName);
  }
}
