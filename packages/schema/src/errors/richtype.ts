export class InvalidRichTypeProperty extends Error {
  constructor(
    public property: string,
    public type: string
  ) {
    super(`Rich type property ${property} must be ${type} type.`);
  }
}
