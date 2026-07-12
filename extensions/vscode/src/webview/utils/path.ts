export const formatPath = (path: string, parameters?: Record<string, string>) => {
  return path.replaceAll(/\{(\w+)\}/g, (_, parameterName) => {
    if (parameters && parameters[parameterName]) {
      return `<span class="variable">${parameters[parameterName]}</span>`;
    }

    return `{${parameterName}}`;
  });
};
