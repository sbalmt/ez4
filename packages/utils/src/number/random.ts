/**
 * Get a random integer for the given interval.
 *
 * @param min Minimum integer value.
 * @param max Maximum integer value.
 */
export const getRandomInteger = (min: number, max: number) => {
  return Math.trunc(Math.random() * (max - min + 1)) + min;
};
