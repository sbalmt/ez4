/**
 * Given the input values and/or arrays, it combines and returns a new array containing only unique elements.
 * Any `undefined` element is discarded.
 *
 * @param values Input values and/or arrays.
 * @returns Returns a new array containing only unique elements.
 */
export const arrayUnique = <T>(...values: (((T | undefined)[] | undefined) | (T | undefined))[]) => {
  const seen = new Set<T>();
  const unique: T[] = [];

  const addValue = (value: T | undefined) => {
    if (value === undefined || seen.has(value)) {
      return;
    }

    unique.push(value);
    seen.add(value);
  };

  for (const value of values) {
    if (value === undefined) {
      continue;
    }

    if (!Array.isArray(value)) {
      addValue(value);
      continue;
    }

    for (const element of value) {
      addValue(element);
    }
  }

  return unique;
};
