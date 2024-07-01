import { TypeError } from './common.js';

export class MissingVariableError extends TypeError {
  constructor(
    public variableName: string,
    public fileName?: string
  ) {
    super(`Variable ${variableName} is not defined or empty.`, fileName);
  }
}
