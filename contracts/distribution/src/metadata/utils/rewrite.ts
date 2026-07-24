const NegationSymbol = '!';

export const isNegationPattern = (uri: string) => {
  return uri.startsWith(NegationSymbol);
};
