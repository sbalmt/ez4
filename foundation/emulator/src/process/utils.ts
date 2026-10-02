import type { ModuleEntrypoint } from './types';

export const formatLogPrefix = (entrypoint: ModuleEntrypoint) => {
  const sourceLocation = `${entrypoint.file}:${entrypoint.position.join(':')}`;
  const logPrefix = `${sourceLocation} [${entrypoint.name}]`;

  return logPrefix;
};
