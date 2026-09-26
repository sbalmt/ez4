import { getBundleHash } from '@ez4/aws-common';

export const getSourceCodeHash = (functionName: string, sourceFiles: string[]) => {
  return getBundleHash(`code:${functionName}`, sourceFiles);
};

export const getExtraFilesHash = (functionName: string, extraFiles: string[]) => {
  return getBundleHash(`file:${functionName}`, extraFiles);
};
