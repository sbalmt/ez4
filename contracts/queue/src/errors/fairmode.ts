import { IncompleteTypeError, IncorrectPropertyError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteFairModeError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete fair mode', properties, fileName);
  }
}

export class InvalidFairModeTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid fair mode type', undefined, 'Queue.FairMode', fileName);
  }
}

export class IncorrectFairModeTypeError extends IncorrectTypeError {
  constructor(modelType: string, fileName?: string) {
    super('Incorrect fair mode type', modelType, 'Queue.FairMode', fileName);
  }
}

export class IncorrectFairModePropertyError extends IncorrectPropertyError {
  constructor(properties: string[], fileName?: string) {
    super('Incorrect fair mode', properties, fileName);
  }
}
