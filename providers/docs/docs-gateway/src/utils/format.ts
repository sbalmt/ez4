export const getIndentedOutput = (input: string[]) => {
  return input.map((line) => (line.length ? `  ${line}` : ``));
};

export const getMultilineOutput = (input: string) => {
  return input.replaceAll(/[\r\n]/g, (_, match) => {
    switch (match) {
      case '\n':
        return '\\n';

      case '\r':
        return '';
    }

    return match;
  });
};

export const getNameOutput = (input: string) => {
  if (/^[a-zA-Z0-9_-]+$/.test(input)) {
    return input;
  }

  return `'${input}'`;
};
