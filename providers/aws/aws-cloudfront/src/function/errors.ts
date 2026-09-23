export class InvalidFunctionNameError extends Error {
  constructor(functionName: string, maxLength: number) {
    super(`Function name ${functionName} exceeds ${maxLength} characters.`);
  }
}
