import type { ReflectionTypes } from '@ez4/reflection';

export const getMetadataServices = (reflection: ReflectionTypes) => {
  console.log('[CUSTOM]: Reflection data with', Object.entries(reflection).length, 'objects');

  return null;
};
