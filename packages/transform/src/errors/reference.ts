export class ReferenceNotFoundError extends Error {
  constructor(public identity: number) {
    super(`Reference ${identity} was not found.`);
  }
}
