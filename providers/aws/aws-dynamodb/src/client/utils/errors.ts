const DUPLICATE_ITEM_ERRORS = ['DuplicateItem', 'DuplicateItemException'];

export const isDuplicateItemError = (error: unknown) => {
  return error instanceof Error && DUPLICATE_ITEM_ERRORS.includes(error.name);
};
