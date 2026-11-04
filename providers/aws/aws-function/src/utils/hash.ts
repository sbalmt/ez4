import { resolve } from 'node:path';

import { getBundleHash } from '@ez4/aws-common';

export const getSourceCodeHash = (functionName: string, sourceFiles: string[], workspacePath?: string) => {
  const currentDirectory = resolve(workspacePath ?? process.cwd());

  return getBundleHash(`code:${currentDirectory}:${functionName}`, sourceFiles, currentDirectory);
};

export const getExtraFilesHash = (functionName: string, extraFiles: string[], workspacePath?: string) => {
  const currentDirectory = resolve(workspacePath ?? process.cwd());

  return getBundleHash(`file:${currentDirectory}:${functionName}`, extraFiles, currentDirectory);
};
