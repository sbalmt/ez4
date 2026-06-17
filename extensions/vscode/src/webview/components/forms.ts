import { getElementById } from '../utils/elements';

export const registerForms = () => {
  const headersForm = getElementById<HTMLFormElement>('form', 'headersForm');
  const parametersForm = getElementById<HTMLFormElement>('form', 'parametersForm');
  const queryForm = getElementById<HTMLFormElement>('form', 'queryForm');

  setupForm(headersForm);
  setupForm(parametersForm);
  setupForm(queryForm);

  return {
    headersForm,
    parametersForm,
    queryForm
  };
};

const setupForm = (form: HTMLFormElement) => {
  form.onsubmit = () => false;
};
