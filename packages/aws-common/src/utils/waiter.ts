import { waitFor } from '@ez4/utils';

export type DeleteAttempter = () => Promise<void>;

export const waitDeletion = async (deleteResource: DeleteAttempter) => {
  await waitFor(async (count, attempts) => {
    const isLastAttempt = count === attempts;

    try {
      await deleteResource();
      return true;
    } catch (error) {
      if (isLastAttempt || !(error instanceof Error) || error.name !== 'ResourceInUseException') {
        throw error;
      }
      return null;
    }
  });
};
