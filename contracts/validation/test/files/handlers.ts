type Request = {
  value: unknown;
};

type Context = {
  testService: {
    validate: (value: unknown) => Promise<void>;
    tryValidate: (value: unknown) => Promise<boolean>;
  };
};

export const validateTest = async ({ value }: Request, { testService }: Context) => {
  await testService.validate(value);
};

export const tryValidateTest = ({ value }: Request, { testService }: Context) => {
  return testService.tryValidate(value);
};
