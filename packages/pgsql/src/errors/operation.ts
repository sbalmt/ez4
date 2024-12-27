export class MissingOperatorError extends Error {
  constructor(public columnName: string) {
    super(`Operator for column ${columnName} is missing.`);
  }
}

export class TooManyOperatorsError extends Error {
  constructor(public columnName: string) {
    super(`Column ${columnName} must have only one operator.`);
  }
}

export class InvalidOperandError extends Error {
  constructor(public columnName?: string) {
    if (columnName) {
      super(`Column ${columnName} has an invalid operand.`);
    } else {
      super(`Column has an invalid operand.`);
    }
  }
}
