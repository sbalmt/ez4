export const assertNoErrors = (errors: Error[]) => {
  if (!errors.length) {
    return;
  }

  for (const error of errors) {
    console.error(error.message);
  }

  process.exit(1);
};
