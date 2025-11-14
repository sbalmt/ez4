/**
 * Split the given array into chunks based on the given chunk size.
 *
 * @param array Input array.
 * @param size Chunk size.
 * @returns Returns an array containing all the chunks.
 */
export const arrayChunk = <T>(array: T[], size: number) => {
  const chunks = [];

  for (let offset = 0; offset < array.length; offset += size) {
    chunks.push(array.slice(offset, offset + size));
  }

  return chunks;
};
