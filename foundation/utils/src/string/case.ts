import { capitalizeString } from './capital';

/**
 * Convert the given `text` into `kebab-case`.
 *
 * @param text Text to convert.
 * @returns Returns the converted text.
 */
export const toKebabCase = (text: string) => {
  return normalize(text)
    .map((piece) => piece.toLowerCase())
    .join('-');
};

/**
 * Convert the given `text` into `snake_case`.
 *
 * @param text Text to convert.
 * @returns Returns the converted text.
 */
export const toSnakeCase = (text: string) => {
  return normalize(text)
    .map((piece) => piece.toLowerCase())
    .join('_');
};

/**
 * Convert the given `text` into `camelCase`.
 *
 * @param text Text to convert.
 * @returns Returns the converted text.
 */
export const toCamelCase = (text: string) => {
  return normalize(text)
    .map((piece, index) => (index > 0 ? capitalizeString(piece) : piece.toLowerCase()))
    .join('');
};

/**
 * Convert the given `text` into `PascalCase`.
 *
 * @param text Text to convert.
 * @returns Returns the converted text.
 */
export const toPascalCase = (text: string) => {
  return normalize(text)
    .map((piece) => capitalizeString(piece))
    .join('');
};

/**
 * Normalize the given `text` keeping only `a-z`, `A-Z` and `0-9` characters.
 *
 * @param text Text to normalize.
 * @returns Returns the converted text.
 */
const normalize = (text: string) => {
  const length = text.length;
  const output = [];

  let pieces = [];

  for (let offset = 0, split = false, uppercase = 0; offset < length; offset++) {
    const character = text[offset];
    const hasPieces = pieces.length > 0;

    if (/[a-z0-9]/.test(character)) {
      if (split) {
        output.push(pieces.join(''));
        pieces = [];
      }

      pieces.push(character);

      split = false;
      uppercase = 0;

      continue;
    }

    if (/[\-_ ]/.test(character)) {
      split = hasPieces && offset + 1 < length;
      uppercase = 0;

      continue;
    }

    if (/[A-Z]/.test(character)) {
      if (hasPieces && (!uppercase || (uppercase > 1 && /[a-z]/.test(text[offset + 1])))) {
        output.push(pieces.join(''));
        pieces = [];
      }

      pieces.push(character);

      split = false;
      uppercase++;
    }
  }

  if (pieces.length > 0) {
    output.push(pieces.join(''));
  }

  return output;
};
