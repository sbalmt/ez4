import type { AllType, ModelProperty, ReflectionTypes, TypeCallback, TypeFunction } from '@ez4/reflection';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

import { IncompleteMiddlewareError } from '../errors/middleware';
import { getFunctionReferences, getFunctionSignature } from '../reflection/function';
import { getPropertyTuple } from '../reflection/property';

export const isServiceMiddleware = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getServiceMiddlewares = (member: ModelProperty, reflection: ReflectionTypes, errorList: Error[]) => {
  const middlewares = getPropertyTuple(member, reflection);

  if (!middlewares) {
    return undefined;
  }

  return middlewares.flatMap((type) => {
    if (!isServiceMiddleware(type)) {
      return [];
    }

    const middleware = getFunctionSignature(type);

    if (!middleware) {
      errorList.push(new IncompleteMiddlewareError(type.file));
      return [];
    }

    if (type.parameters) {
      const [, contextType] = type.parameters;

      if (contextType) {
        const references = getFunctionReferences(contextType);

        if (references) {
          middleware.references = references;
        }
      }
    }

    return [middleware];
  });
};
