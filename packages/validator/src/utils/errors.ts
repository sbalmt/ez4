/**
 * Get only unique error messages from the given error list.
 *
 * @param errorList Error list.
 * @returns Returns an array containing only unique error messages.
 */
export const getUniqueErrorMessages = (errorList: Error[]) => {
  const errorSet = new Set<string>();

  for (const { message } of errorList) {
    errorSet.add(message);
  }

  return [...errorSet.values()];
};
