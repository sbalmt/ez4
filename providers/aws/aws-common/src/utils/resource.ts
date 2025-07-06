import type { EntryState } from '@ez4/stateful';

export const hasResourceResult = <T extends EntryState>(candidate: T): candidate is Required<T> => {
  return !!candidate.result;
};
