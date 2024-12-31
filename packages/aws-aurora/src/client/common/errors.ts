export class MalformedRequestError extends Error {
  constructor(public details: string[]) {
    super(`Malformed table schema.`);
  }
}

export class MissingRelationDataError extends Error {
  constructor(public alias: string) {
    super(`Relation data for ${alias} is missing.`);
  }
}

export class InvalidRelationFieldError extends Error {
  constructor(public field: string) {
    super(`Relation field ${field} has an invalid format.`);
  }
}
