import { IncompleteTypeError, IncorrectPropertyError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

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
  constructor(modelType: string, fileName?: string) {
    super('Incorrect fifo mode type', modelType, 'Queue.FifoMode', fileName);
  }
}

export class IncorrectFifoModePropertyError extends IncorrectPropertyError {
  constructor(properties: string[], fileName?: string) {
    super('Incorrect fifo mode', properties, fileName);
  }
}
