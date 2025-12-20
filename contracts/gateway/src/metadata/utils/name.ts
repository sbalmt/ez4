export const getFullTypeName = (namespace: string, type: string) => {
  return `${namespace}.${type}`;
};

export const getValidatorName = (type: string) => {
  return `@${type}`;
};
