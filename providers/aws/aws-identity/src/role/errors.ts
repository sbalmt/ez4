export class InvalidRoleNameError extends Error {
  constructor(roleName: string, maxLength: number) {
    super(`Role name ${roleName} exceeds ${maxLength} characters.`);
  }
}
