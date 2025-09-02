/**
 * Join all the given pieces into a single string omitting `null` and `undefined` pieces.
 *
 * @param separator String separator.
 * @param pieces String pieces.
 * @returns Returns a string containing all the given pieces.
 */
export const joinString = (separator: string, pieces: (number | string | undefined | null)[]) => {
  return pieces.filter((piece) => piece !== undefined && piece !== null).join(separator);
};
