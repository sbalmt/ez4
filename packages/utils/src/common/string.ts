/**
 * Normalize the given `text` keeping only `a-z`, `0-9`, `-` and `_` characters.
 *
 * @param text Text to convert.
 * @param separator Word separator.
 * @returns Returns the converted text.
 */
export const normalize = (text: string, separator: string) => {
  const output: string[] = [];
  const length = text.length;

  for (let offset = 0, pending = false, uppercase = 0; offset < length; offset++) {
    const character = text[offset];
    const hasOutput = output.length > 0;

    if (/[a-z0-9]/.test(character)) {
      if (pending) {
        output.push(separator);
      }

      output.push(character);

      pending = false;
      uppercase = 0;

      continue;
    }

    if (/[\-_ ]/.test(character)) {
      pending = hasOutput && offset + 1 < length;
      uppercase = 0;

      continue;
    }

    if (/[A-Z]/.test(character)) {
      if (hasOutput && (!uppercase || (uppercase > 1 && /[a-z]/.test(text[offset + 1])))) {
        output.push(separator);
      }

      output.push(character.toLowerCase());

      pending = false;
      uppercase++;
    }
  }

  return output.join('');
};

/**
 * Convert the given `text` into kebab-case.
 *
 * @param text Text to convert.
 * @returns Returns the converted text.
 */
export const toKebabCase = (text: string) => {
  return normalize(text, '-');
};

/**
 * Convert the given `text` into camcel_case.
 *
 * @param text Text to convert.
 * @returns Returns the converted text.
 */
export const toCamelCase = (text: string) => {
  return normalize(text, '_');
};
