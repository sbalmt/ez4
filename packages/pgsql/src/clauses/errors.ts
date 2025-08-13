export class TooManyClausesError extends Error {
  constructor() {
    super('Multiple clauses for a single statement.');
  }
}

export class MissingClauseError extends Error {
  constructor() {
    super('Missing statement clause.');
  }
}
