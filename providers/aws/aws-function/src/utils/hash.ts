import { resolve } from 'node:path';

import { getBundleHash } from '@ez4/aws-common';

export const getSourceCodeHash = (functionName: string, sourceFiles: string[], workspacePath: string) => {
  const resolvedWorkspacePath = resolve(workspacePath);

  return getBundleHash(`code:${resolvedWorkspacePath}:${functionName}`, sourceFiles, resolvedWorkspacePath);
};

export const getExtraFilesHash = (functionName: string, extraFiles: string[], workspacePath: string) => {
  const resolvedWorkspacePath = resolve(workspacePath);

  return getBundleHash(`file:${resolvedWorkspacePath}:${functionName}`, extraFiles, resolvedWorkspacePath);
};
