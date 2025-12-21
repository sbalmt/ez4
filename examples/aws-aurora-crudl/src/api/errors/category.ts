export class CategoryNotFound extends Error {
  constructor() {
    super(`The given category wasn't found.`);
  }
}
