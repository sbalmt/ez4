export class TypeError extends Error {
  constructor(
    message: string,
    public fileName?: string
  ) {
    super(`${fileName ? `${fileName}:\n\t` : ``}${message}`);
  }
}

export class TypeCollisionError extends TypeError {
  constructor(
    message: string,
    public property: string,
    public fileName?: string
  ) {
    super(`${message}, property '${property}' is colliding.`, fileName);
  }
}

export class IncompleteTypeError extends TypeError {
  constructor(
    message: string,
    public properties: string[],
    public fileName?: string
  ) {
    if (properties.length > 1) {
      super(`${message}, properties [${properties.join(', ')}] are invalid or missing.`, fileName);
    } else if (properties.length > 0) {
      super(`${message}, property '${properties[0]}' is invalid or missing.`, fileName);
    } else {
      super(`${message}, properties are invalid or missing.`, fileName);
    }
  }
}

export class InvalidTypeError extends TypeError {
  constructor(
    message: string,
    public modelType?: string,
    public baseType?: string,
    public fileName?: string
  ) {
    const type = modelType ?? 'it';

    if (baseType) {
      super(`${message}, ${type} must be a declaration and derive from ${baseType}.`, fileName);
    } else {
      super(`${message}, ${type} must be a declaration.`, fileName);
    }
  }
}

export class IncorrectTypeError extends TypeError {
  constructor(
    message: string,
    public modelType: string,
    public baseType: string,
    public fileName?: string
  ) {
    super(`${message}, ${modelType} must derive from ${baseType}.`, fileName);
  }
}

export class IncorrectPropertyError extends TypeError {
  constructor(
    message: string,
    public properties: string[],
    public fileName?: string
  ) {
    if (properties.length > 1) {
      super(`${message}, properties [${properties.join(', ')}] aren't expected.`, fileName);
    } else {
      super(`${message}, property '${properties[0]}' isn't expected.`, fileName);
    }
  }
}
