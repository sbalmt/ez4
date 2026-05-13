import { toKebabCase } from '@ez4/utils';

export const getServicePrefix = (prefix?: string) => {
  return toKebabCase(prefix ?? 'ez4');
};

export const getServiceBranch = (branch?: string) => {
  return branch ? toKebabCase(branch) : '';
};
