export const preparePathParameters = (path: string, parameters: Record<string, string>) => {
  return path.replaceAll(/\{(\w+)\}/g, (_, parameterName) => {
    if (parameterName in parameters) {
      return `${parameters[parameterName]}`;
    }

    return `{${parameterName}}`;
  });
};
