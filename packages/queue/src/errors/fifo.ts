import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteFifoModeError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete fifo mode', properties, fileName);
  }
}

export class InvalidFifoModeTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid fifo mode type', undefined, 'Queue.FifoMode', fileName);
  }
}

export class IncorrectFifoModeTypeError extends IncorrectTypeError {
  constructor(
    public type: string,
    fileName?: string
  ) {
    super('Incorrect fifo mode type', type, 'Queue.FifoMode', fileName);
  }
}
