import { getElementById } from '../utils/elements';

export const registerForms = () => {
  const headersForm = getElementById('form', 'headersForm');
  const parametersForm = getElementById('form', 'parametersForm');
  const queryForm = getElementById('form', 'queryForm');

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
