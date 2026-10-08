import type { AnyObject } from '@ez4/utils';
import type { ServiceFactories, ServiceReferences } from '../types/service';

import { isAnyString } from '@ez4/utils';

export const getLazyContext = (services: ServiceFactories, references: ServiceReferences) => {
  const context = getContextFactories(services, references);

  return new Proxy(context, {
    get: (target, property) => {
      if (!isAnyString(property) || !(property in target)) {
        if (property !== 'then') {
          throw new Error(`Context service '${property.toString()}' not found.`);
        }

        return undefined;
      }

      if (target[property] instanceof Function) {
        target[property] = target[property]();
      }

      return target[property];
    }
  });
};

const getContextFactories = (services: ServiceFactories, references: ServiceReferences) => {
  const context: AnyObject = {};

  for (const name in references) {
    const identifier = references[name];
    context[name] = services[identifier];
  }

  return context;
};
