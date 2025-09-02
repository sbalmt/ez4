export class UnexpectedPropertiesError extends Error {
  constructor(public propertyNames: string[]) {
    if (propertyNames.length === 1) {
      super(`Property [${propertyNames[0]}] is not expected.`);
    } else if (propertyNames.length < 15) {
      super(`Properties [${propertyNames.join(', ')}] are not expected.`);
    } else {
      super(`Remove all unexpected properties.`);
    }
  }
}

export class UnexpectedValueError extends Error {
  constructor(
    public valueOptions: string[],
    public propertyName?: string
  ) {
    if (valueOptions.length === 1) {
      if (propertyName) {
        super(`Value ${valueOptions[0]} for [${propertyName}] is expected.`);
      } else {
        super(`Value ${valueOptions[0]} is expected.`);
      }
    } else {
      if (propertyName) {
        super(`A value in [${valueOptions.join(', ')}] for ${propertyName} is expected.`);
      } else {
        super(`A value in [${valueOptions.join(', ')}] is expected.`);
      }
    }
  }
}

export class UnexpectedTypeError extends Error {
  constructor(
    public typeName: string,
    public propertyName?: string
  ) {
    if (propertyName) {
      super(`Type ${typeName} for [${propertyName}] is expected.`);
    } else {
      super(`Type ${typeName} is expected.`);
    }
  }
}

export class UnexpectedFormatError extends Error {
  constructor(
    public typeName: string,
    public formatName: string,
    public propertyName?: string
  ) {
    if (propertyName) {
      super(`Type ${typeName} with format ${formatName} for [${propertyName}] is expected.`);
    } else {
      super(`Type ${typeName} with format ${formatName} is expected.`);
    }
  }
}
