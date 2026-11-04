import { sys } from 'typescript';

export const getCanonicalFileName = (fileName: string) => {
  return sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
};

export const normalizePath = (path: string) => {
  return path.replaceAll('\\', '/');
};
