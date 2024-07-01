import AdminZip from 'adm-zip';

import { readFile } from 'node:fs/promises';

export const getZipBuffer = async (filePath: string, entryName: string) => {
  const zip = new AdminZip();
  const buffer = await readFile(filePath);

  zip.addFile(entryName, buffer);

  return zip.toBufferPromise();
};
