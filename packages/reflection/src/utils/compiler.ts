import { sys } from 'typescript';

export const getCanonicalFileName = (fileName: string) => {
  if (!sys.useCaseSensitiveFileNames) {
    return fileName.toLowerCase();
  }

  return fileName;
};
