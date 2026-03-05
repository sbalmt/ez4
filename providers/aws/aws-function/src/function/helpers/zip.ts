import { dirname, normalize } from 'node:path';

import AdminZip from 'adm-zip';

export const getZipBuffer = async (filePath: string, entryName: string, additionalFiles?: string[]) => {
  const zip = new AdminZip();

  additionalFiles?.forEach((localFile) => {
    zip.addLocalFile(localFile, dirname(normalize(localFile)));
  });

  zip.addLocalFile(filePath, undefined, entryName);

  return zip.toBufferPromise();
};
