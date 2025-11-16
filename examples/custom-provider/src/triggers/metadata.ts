import type { SourceMap } from '@ez4/reflection';

export const getMetadataServices = (reflection: SourceMap) => {
  console.log('[CUSTOM]: Reflection data with', Object.entries(reflection).length, 'objects');

  return null;
};
