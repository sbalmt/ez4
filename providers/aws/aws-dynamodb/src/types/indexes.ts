import { toKebabCase } from '@ez4/utils';

export const getIndexName = (indexParts: string[]) => {
  return `${toKebabCase(indexParts.join('-'))}-index`;
};
