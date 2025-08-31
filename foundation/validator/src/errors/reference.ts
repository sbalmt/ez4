export class ReferenceNotFoundError extends Error {
  constructor(
    public reference: number,
    public propertyName?: string
  ) {
    if (reference) {
      super(`Reference ${reference} for property ${propertyName} is not found.`);
    } else {
      super(`Reference ${reference} is not found.`);
    }
  }
}
