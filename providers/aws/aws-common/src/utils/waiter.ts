import { waitFor } from '@ez4/utils';

export type ActionAttempter<T> = () => Promise<T>;

const DefaultRetryErrors = ['TooManyRequestsException', 'ConflictException', 'InvalidParameterValueException'];

/**
 * Try to create a resource using the given function, and if the creation fails,
 * it will keep trying until the maximum attempts.
 *
 * @param createResource Resource creation function.
 * @param retryErrors Extra errors to retry.
 * @returns Returns the creation function result.
 */
export const waitCreation = async <T>(createResource: ActionAttempter<T>, retryErrors: string[] = []) => {
  return waitAction(createResource, [...DefaultRetryErrors, ...retryErrors]);
};

/**
 * Try to delete a resource using the given function, and if the deletion fails,
 * it will keep trying until the maximum attempts.
 *
 * @param deleteResource Resource deletion function.
 * @param retryErrors Extra errors to retry.
 *
 * @returns Returns the deletion function result.
 */
export const waitDeletion = async <T>(deleteResource: ActionAttempter<T>, retryErrors: string[] = []) => {
  return waitAction(deleteResource, [...DefaultRetryErrors, ...retryErrors]);
};

/**
 * Try to perform the given action function, and if it fails, it will keep trying
 * until the maximum attempts as long as the error name is retryable.
 *
 * @param actionFunction Action function.
 * @param retryErrors List of error names to retry.
 *
 * @returns Returns the action function result.
 */
export const waitAction = async <T>(actionFunction: ActionAttempter<T>, retryErrors: string[]) => {
  let lastError;

  const result = await waitFor(async (count, attempts) => {
    const isLastAttempt = count === attempts;

    try {
      return await actionFunction();
    } catch (error) {
      if (isLastAttempt || !(error instanceof Error) || !retryErrors.includes(error.name)) {
        throw error;
      }

      lastError = error;

      return null;
    }
  });

  if (result === null) {
    throw lastError;
  }

  return result;
};
