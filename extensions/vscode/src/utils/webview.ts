export const getMainElement = () => {
  const element = document.querySelector('body>main');

  if (!element) {
    throw new Error('Unable to get main content element.');
  }

  return element;
};
